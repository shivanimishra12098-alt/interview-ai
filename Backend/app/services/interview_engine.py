"""InterviewEngine: the deterministic state machine that owns interview
control flow. The LLM generates language (questions, evaluations,
follow-ups, feedback); this engine is the only thing that decides
when the interview is allowed to end, and enforces MIN_QUESTIONS,
MIN_CURRICULUM_DAYS, and MAX_QUESTIONS regardless of what the LLM
returns.
"""
from __future__ import annotations

import random

from app.config import Settings
from app.llm.provider import LLMProvider, LLMProviderError
from app.schemas.candidate import Candidate
from app.schemas.interview import (
    AnswerClassification,
    AskedQuestionRecord,
    Difficulty,
    InterviewPlanItem,
    InterviewState,
)
from app.services import feedback_generator, question_generator
from app.services.answer_evaluator import evaluate_answer as _evaluate_answer
from app.services.candidate_analyzer import build_candidate_profile
from app.services.curriculum_service import CurriculumService
from app.services.topic_selector import build_interview_plan
from app.utils.logging import get_logger

logger = get_logger(__name__)

_DIFFICULTY_ORDER = [Difficulty.easy, Difficulty.medium, Difficulty.hard]


def _bump_difficulty(current: Difficulty, up: bool) -> Difficulty:
    idx = _DIFFICULTY_ORDER.index(current)
    if up:
        idx = min(idx + 1, len(_DIFFICULTY_ORDER) - 1)
    else:
        idx = max(idx - 1, 0)
    return _DIFFICULTY_ORDER[idx]


class InterviewEngineError(Exception):
    pass


class InterviewEngine:
    def __init__(self, llm: LLMProvider, curriculum: CurriculumService, settings: Settings, rng: random.Random | None = None):
        self.llm = llm
        self.curriculum = curriculum
        self.settings = settings
        self.rng = rng or random.Random()

    # ------------------------------------------------------------------
    # start
    # ------------------------------------------------------------------
    def start_interview(self, session_id: str, candidate_raw: dict) -> tuple[InterviewState, str]:
        try:
            candidate = Candidate.model_validate(candidate_raw)
        except Exception as exc:
            raise InterviewEngineError(f"candidate payload failed schema validation: {exc}") from exc

        profile = build_candidate_profile(candidate)

        # Plan for at least MIN_CURRICULUM_DAYS distinct topics, with a
        # little headroom so follow-ups don't strand us short of the
        # minimum question count.
        target_topics = max(self.settings.min_curriculum_days, 4)
        plan = build_interview_plan(profile, self.curriculum, target_topics=target_topics, rng=self.rng)
        if not plan:
            raise InterviewEngineError("Unable to build an interview plan: curriculum has no valid days.")

        state = InterviewState(
            session_id=session_id,
            candidate_id=candidate.member.id,
            candidate_raw=candidate_raw,
            candidate_profile=profile,
            interview_plan=plan,
            difficulty=Difficulty.medium,
        )

        welcome = (
            f"Welcome, {candidate.member.name}. I'll be conducting your technical interview today, "
            f"based on your progress through the cohort. Let's begin."
        )
        state.add_message("interviewer", welcome)

        first_item = plan[0]
        question_reply = self._ask_new_topic(state, first_item)
        full_reply = f"{welcome}\n\n{question_reply}"
        return state, full_reply

    # ------------------------------------------------------------------
    # continue
    # ------------------------------------------------------------------
    def process_answer(self, state: InterviewState, message: str) -> tuple[InterviewState, str, bool]:
        if state.done:
            raise InterviewEngineError("This interview has already been completed.")
        if not state.asked_questions:
            raise InterviewEngineError("No question has been asked yet for this session.")

        candidate = Candidate.model_validate(state.candidate_raw)
        current = state.asked_questions[-1]
        current.candidate_answer = message
        state.add_message("candidate", message)

        try:
            evaluation = _evaluate_answer(
                llm=self.llm,
                question=current.question,
                answer=message,
                conversation_history=state.conversation_history,
            )
        except LLMProviderError as exc:
            logger.warning("LLM evaluation failed, applying conservative fallback: %s", exc)
            evaluation = self._fallback_evaluation()

        current.evaluation = evaluation
        self._record_signal(state, current)

        state.difficulty = self._adapt_difficulty(state.difficulty, evaluation)

        if self._should_complete(state):
            self._complete(state, candidate)
            # technical-spec.md fixes this exact reply text for the final turn.
            reply = "Interview completed."
            return state, reply, True

        reply = self._advance(state, candidate, evaluation)
        return state, reply, False

    # ------------------------------------------------------------------
    # internal: advancing the interview
    # ------------------------------------------------------------------
    def _advance(self, state: InterviewState, candidate: Candidate, evaluation) -> str:
        should_follow_up = self.decide_follow_up(state, evaluation)
        if should_follow_up:
            return self._ask_follow_up(state, candidate)

        next_item = self._next_plan_item(state)
        if next_item is None:
            # Plan exhausted but minimums not yet met -- pull any unused
            # valid curriculum day rather than repeating one.
            next_item = self._emergency_topic(state)
        return self._ask_new_topic(state, next_item, candidate=candidate)

    def decide_follow_up(self, state: InterviewState, evaluation) -> bool:
        if evaluation.recommended_action not in ("follow_up", "clarify_fundamentals"):
            return False
        if state.follow_up_count >= self.settings.max_follow_ups_per_topic:
            return False
        if state.question_count >= self.settings.max_questions:
            return False
        return True

    def _next_plan_item(self, state: InterviewState) -> InterviewPlanItem | None:
        used_days = set(state.covered_curriculum_days)
        for item in state.interview_plan:
            if item.curriculum_day not in used_days:
                return item
        return None

    def _emergency_topic(self, state: InterviewState) -> InterviewPlanItem:
        used_days = set(state.covered_curriculum_days)
        remaining = [d for d in self.curriculum.all_day_numbers() if d not in used_days]
        if not remaining:
            # Every day has been covered; revisit the least-recently-covered day.
            day = state.covered_curriculum_days[0]
        else:
            day = self.rng.choice(remaining)
        cd = self.curriculum.require_day(day)
        return InterviewPlanItem(curriculum_day=day, topic=cd.title, reason="fallback: minimums not yet met")

    def _ask_new_topic(self, state: InterviewState, item: InterviewPlanItem, candidate: Candidate | None = None) -> str:
        candidate = candidate or Candidate.model_validate(state.candidate_raw)
        state.follow_up_count = 0
        state.current_curriculum_day = item.curriculum_day
        state.current_topic = item.topic

        previously_asked = [r.question.question for r in state.asked_questions]
        try:
            question = question_generator.generate_question(
                llm=self.llm,
                curriculum=self.curriculum,
                candidate=candidate,
                profile=state.candidate_profile,
                curriculum_day=item.curriculum_day,
                topic=item.topic,
                difficulty=state.difficulty,
                conversation_history=state.conversation_history,
                previously_asked=previously_asked,
            )
        except Exception as exc:
            logger.warning("Question generation failed, using safe fallback: %s", exc)
            question = self._fallback_question(item, state.difficulty)

        state.question_count += 1
        if item.curriculum_day not in state.covered_curriculum_days:
            state.covered_curriculum_days.append(item.curriculum_day)
        if item.topic not in state.covered_topics:
            state.covered_topics.append(item.topic)

        record = AskedQuestionRecord(index=state.question_count, question=question)
        state.asked_questions.append(record)
        state.add_message("interviewer", question.question)
        return question.question

    def _ask_follow_up(self, state: InterviewState, candidate: Candidate) -> str:
        last = state.asked_questions[-1]
        try:
            follow_up = self.llm.generate_follow_up(
                candidate=candidate,
                profile=state.candidate_profile,
                original_question=last.question,
                answer=last.candidate_answer or "",
                evaluation=last.evaluation,
                conversation_history=state.conversation_history,
            )
        except LLMProviderError as exc:
            logger.warning("Follow-up generation failed, using safe fallback: %s", exc)
            follow_up = self._fallback_question(
                InterviewPlanItem(curriculum_day=last.question.curriculum_day, topic=last.question.topic, reason="fallback"),
                state.difficulty,
                is_follow_up=True,
            )

        previously_asked = {r.question.question.strip() for r in state.asked_questions}
        if follow_up.question.strip() in previously_asked:
            follow_up.question += " (Specifically, what would you check first?)"

        state.follow_up_count += 1
        state.question_count += 1
        record = AskedQuestionRecord(index=state.question_count, question=follow_up)
        state.asked_questions.append(record)
        state.add_message("interviewer", follow_up.question)
        return follow_up.question

    # ------------------------------------------------------------------
    # internal: evaluation bookkeeping
    # ------------------------------------------------------------------
    def _record_signal(self, state: InterviewState, record: AskedQuestionRecord) -> None:
        evaluation = record.evaluation
        if evaluation is None:
            return
        topic = record.question.topic
        if evaluation.classification in (AnswerClassification.strong, AnswerClassification.adequate):
            note = f"{topic}: {evaluation.classification.value} (score {evaluation.score}/10)"
            if note not in state.strengths:
                state.strengths.append(note)
        else:
            note = f"{topic}: {evaluation.classification.value} (score {evaluation.score}/10)"
            if note not in state.gaps:
                state.gaps.append(note)

    def _adapt_difficulty(self, current: Difficulty, evaluation) -> Difficulty:
        if evaluation.classification == AnswerClassification.strong:
            return _bump_difficulty(current, up=True)
        if evaluation.classification in (AnswerClassification.weak, AnswerClassification.incorrect):
            return _bump_difficulty(current, up=False)
        return current

    # ------------------------------------------------------------------
    # internal: completion
    # ------------------------------------------------------------------
    def _should_complete(self, state: InterviewState) -> bool:
        minimums_met = (
            state.question_count >= self.settings.min_questions
            and len(state.covered_curriculum_days) >= self.settings.min_curriculum_days
        )
        forced_stop = state.question_count >= self.settings.max_questions
        if forced_stop:
            return True
        if not minimums_met:
            return False
        # Minimums are met -- wrap up once the current topic doesn't need
        # another follow-up (avoid ending mid-probe).
        last = state.asked_questions[-1]
        needs_follow_up = (
            last.evaluation is not None
            and last.evaluation.recommended_action in ("follow_up", "clarify_fundamentals")
            and state.follow_up_count < self.settings.max_follow_ups_per_topic
        )
        return not needs_follow_up

    def _complete(self, state: InterviewState, candidate: Candidate):
        try:
            feedback = feedback_generator.generate_feedback(
                llm=self.llm,
                candidate=candidate,
                profile=state.candidate_profile,
                asked_questions=state.asked_questions,
            )
        except LLMProviderError as exc:
            logger.warning("Feedback generation failed, using deterministic fallback: %s", exc)
            feedback = self._fallback_feedback(state, candidate)

        state.feedback = feedback
        state.done = True
        from datetime import datetime, timezone
        state.completed_at = datetime.now(timezone.utc)
        state.add_message("interviewer", "Interview completed.")
        return feedback

    # ------------------------------------------------------------------
    # internal: fallbacks (used when the LLM provider errors out, so the
    # interview never crashes even if the LLM is unavailable)
    # ------------------------------------------------------------------
    def _fallback_evaluation(self):
        from app.schemas.interview import AnswerEvaluation
        return AnswerEvaluation(
            score=5,
            classification=AnswerClassification.adequate,
            strengths=[],
            weaknesses=["Automated evaluation was unavailable; scored conservatively."],
            concepts_demonstrated=[],
            concepts_missing=[],
            incorrect_claims=[],
            recommended_action="follow_up",
        )

    def _fallback_question(self, item: InterviewPlanItem, difficulty: Difficulty, is_follow_up: bool = False):
        from app.schemas.interview import GeneratedQuestion, QuestionType
        text = (
            f"Let's talk about {item.topic}. Can you walk me through how you'd approach this in a real project?"
            if not is_follow_up
            else f"Can you say more about how you'd verify that approach to {item.topic} actually works?"
        )
        return GeneratedQuestion(
            question=text,
            curriculum_day=item.curriculum_day,
            topic=item.topic,
            difficulty=difficulty,
            question_type=QuestionType.practical,
            rationale="Fallback question used because the LLM provider was unavailable.",
            is_follow_up=is_follow_up,
        )

    def _fallback_feedback(self, state: InterviewState, candidate: Candidate):
        from app.schemas.interview import InterviewFeedback
        days = sorted(set(state.covered_curriculum_days))
        return InterviewFeedback(
            summary=(
                f"{candidate.member.name} completed a {state.question_count}-question interview covering "
                f"curriculum day(s) {days}. Automated feedback generation was degraded; this is a "
                f"conservative summary based on recorded scores."
            ),
            strengths=state.strengths[:5] or ["No strong signal captured."],
            gaps=state.gaps[:5] or ["No significant gaps captured."],
            next=["Schedule a manual follow-up review since automated feedback generation was degraded."],
        )
