"""A deterministic, offline LLMProvider.

Used by the test suite and scripts/demo.py so the whole system can be
exercised without an API key or network access. It does real (if
simple) content-based reasoning -- not just canned strings -- so tests
of adaptive behavior remain meaningful.
"""
from __future__ import annotations

import random
import re
from typing import Any

from app.schemas.candidate import Candidate
from app.schemas.interview import (
    AnswerClassification,
    AnswerEvaluation,
    CandidateProfile,
    Difficulty,
    GeneratedQuestion,
    InterviewFeedback,
    QuestionType,
)
from app.llm.provider import LLMProvider

# Question banks keyed by (curriculum_day_type or generic), used to produce
# varied, non-trivial engineering questions grounded in the given topic.
_QUESTION_STEMS = {
    QuestionType.scenario_based: (
        "Imagine you're running {topic} in production and results start "
        "degrading. Walk me through how you'd isolate the root cause."
    ),
    QuestionType.trade_off: (
        "What trade-offs would you weigh when choosing your approach to "
        "{topic}, and how would experience level or scale change that decision?"
    ),
    QuestionType.architecture: (
        "How would you architect {topic} so it stays reliable as usage grows "
        "10x? What would you change first?"
    ),
    QuestionType.debugging: (
        "A teammate says {topic} is 'not working right' but can't be more "
        "specific. What would you check first, second, and third?"
    ),
    QuestionType.implementation: (
        "Walk me through how you would actually implement {topic} end to "
        "end -- what are the key decisions along the way?"
    ),
    QuestionType.system_design: (
        "Design a system that relies on {topic} for a team with real "
        "production constraints. What are the key components and risks?"
    ),
    QuestionType.practical: (
        "Tell me about a time (real or hypothetical) you used {topic} to "
        "solve a concrete problem. What made it work?"
    ),
    QuestionType.conceptual: (
        "What's the core idea behind {topic}, and what's a common "
        "misconception engineers have about it?"
    ),
}

_TYPES_BY_DIFFICULTY = {
    Difficulty.easy: [QuestionType.conceptual, QuestionType.practical],
    Difficulty.medium: [QuestionType.practical, QuestionType.implementation, QuestionType.debugging, QuestionType.trade_off],
    Difficulty.hard: [QuestionType.architecture, QuestionType.system_design, QuestionType.trade_off, QuestionType.scenario_based],
}

_WEAK_SIGNAL_WORDS = {"not sure", "don't know", "no idea", "not really", "maybe", "i think", "guess"}
_STRONG_SIGNAL_WORDS = {
    "trade-off", "tradeoff", "because", "latency", "scale", "failure", "precision", "recall",
    "throughput", "cost", "cache", "reranking", "chunking", "evaluation", "benchmark", "monitor",
}


class MockLLMProvider(LLMProvider):
    def __init__(self, seed: int | None = 42):
        self._rng = random.Random(seed)

    # -- question generation -----------------------------------------
    def generate_question(
        self,
        *,
        candidate: Candidate,
        profile: CandidateProfile,
        curriculum_day: Any,
        topic: str,
        difficulty: Difficulty,
        conversation_history: list[dict],
        avoid_questions: list[str],
    ) -> GeneratedQuestion:
        candidate_types = _TYPES_BY_DIFFICULTY[difficulty]
        qtype = self._rng.choice(candidate_types)

        for _ in range(6):  # avoid duplicates against previously asked questions
            stem = _QUESTION_STEMS[qtype]
            question_text = stem.format(topic=topic)
            if question_text not in avoid_questions:
                break
            qtype = self._rng.choice(list(QuestionType))
        else:
            question_text = f"[{difficulty.value}] Deep dive on {topic}: {self._rng.randint(1000,9999)}"

        return GeneratedQuestion(
            question=question_text,
            curriculum_day=curriculum_day.day,
            topic=topic,
            difficulty=difficulty,
            question_type=qtype,
            rationale=f"Grounded in curriculum day {curriculum_day.day} ({curriculum_day.title}); "
                      f"selected for candidate experience level '{profile.experience_level}'.",
        )

    # -- answer evaluation ----------------------------------------------
    def evaluate_answer(
        self,
        *,
        question: GeneratedQuestion,
        answer: str,
        conversation_history: list[dict],
    ) -> AnswerEvaluation:
        lower = answer.lower()
        word_count = len(re.findall(r"\w+", answer))

        weak_hits = sum(1 for w in _WEAK_SIGNAL_WORDS if w in lower)
        strong_hits = sum(1 for w in _STRONG_SIGNAL_WORDS if w in lower)

        if word_count < 4 or weak_hits >= 1:
            classification = AnswerClassification.incomplete if word_count >= 4 else AnswerClassification.weak
            score = max(0, 2 - weak_hits)
            action = "clarify_fundamentals" if classification == AnswerClassification.weak else "follow_up"
        elif strong_hits >= 3 and word_count >= 25:
            classification = AnswerClassification.strong
            score = min(10, 7 + strong_hits)
            action = "increase_difficulty"
        elif strong_hits >= 1 or word_count >= 15:
            classification = AnswerClassification.adequate
            score = 5 + min(3, strong_hits)
            action = "follow_up"
        else:
            classification = AnswerClassification.incomplete
            score = 3
            action = "follow_up"

        demonstrated = [w for w in _STRONG_SIGNAL_WORDS if w in lower][:5]
        missing = [w for w in _STRONG_SIGNAL_WORDS if w not in lower][:3]

        return AnswerEvaluation(
            score=score,
            classification=classification,
            strengths=[f"Mentioned {c}" for c in demonstrated] or [],
            weaknesses=[] if classification in (AnswerClassification.strong, AnswerClassification.adequate)
                        else ["Answer lacked technical specificity or hedged heavily."],
            concepts_demonstrated=demonstrated,
            concepts_missing=missing,
            incorrect_claims=[],
            recommended_action=action,
        )

    # -- follow-up generation ---------------------------------------
    def generate_follow_up(
        self,
        *,
        candidate: Candidate,
        profile: CandidateProfile,
        original_question: GeneratedQuestion,
        answer: str,
        evaluation: AnswerEvaluation,
        conversation_history: list[dict],
    ) -> GeneratedQuestion:
        if evaluation.classification in (AnswerClassification.strong,):
            text = (
                f"You covered {original_question.topic} well. What would break first if this had to "
                f"handle 10x the traffic, and how would you find out before it happens in production?"
            )
            difficulty = Difficulty.hard
            qtype = QuestionType.architecture
        elif evaluation.concepts_missing:
            missing = evaluation.concepts_missing[0]
            text = (
                f"You mentioned an approach to {original_question.topic}, but didn't touch on {missing}. "
                f"How would {missing} change your answer, and how would you verify it in practice?"
            )
            difficulty = original_question.difficulty
            qtype = QuestionType.trade_off
        else:
            text = (
                f"Let's go back to fundamentals on {original_question.topic} -- can you walk through the "
                f"core mechanism step by step, in your own words?"
            )
            difficulty = Difficulty.easy
            qtype = QuestionType.conceptual

        return GeneratedQuestion(
            question=text,
            curriculum_day=original_question.curriculum_day,
            topic=original_question.topic,
            difficulty=difficulty,
            question_type=qtype,
            rationale=f"Follow-up based on candidate's answer classification: {evaluation.classification.value}.",
            is_follow_up=True,
        )

    # -- feedback -----------------------------------------------------
    def generate_feedback(
        self,
        *,
        candidate: Candidate,
        profile: CandidateProfile,
        asked_questions: list,
    ) -> InterviewFeedback:
        strengths, gaps, next_steps = [], [], []
        topics_seen = {}

        for rec in asked_questions:
            if rec.evaluation is None:
                continue
            topic = rec.question.topic
            topics_seen.setdefault(topic, []).append(rec.evaluation)

        for topic, evals in topics_seen.items():
            avg = sum(e.score for e in evals) / len(evals)
            if avg >= 7:
                strengths.append(f"Demonstrated strong understanding of {topic} across {len(evals)} question(s).")
            elif avg <= 4:
                gaps.append(f"Showed gaps in {topic}: struggled to go beyond surface-level answers.")
                missing = sorted({m for e in evals for m in e.concepts_missing})[:3]
                if missing:
                    next_steps.append(
                        f"Practice {topic} by explicitly working through: {', '.join(missing)}."
                    )
                else:
                    next_steps.append(f"Revisit the core fundamentals of {topic} with hands-on practice.")
            else:
                gaps.append(f"Mixed performance on {topic} -- correct instincts but incomplete depth.")
                next_steps.append(f"Deepen {topic} by practicing trade-off and failure-mode reasoning, not just definitions.")

        if not next_steps:
            next_steps.append("Continue practicing system-design-level reasoning across the covered topics.")

        distinct_days = sorted({rec.question.curriculum_day for rec in asked_questions})
        summary = (
            f"{candidate.member.name} completed a {len(asked_questions)}-question adaptive interview "
            f"spanning curriculum day(s) {distinct_days}. Overall the candidate showed "
            f"{'strong' if len(strengths) >= len(gaps) else 'developing'} technical depth relative to "
            f"their {profile.experience_level} experience level."
        )

        return InterviewFeedback(
            summary=summary,
            strengths=strengths or ["No strong signal captured -- consider a longer follow-up interview."],
            gaps=gaps or ["No significant gaps identified in the topics assessed."],
            next=next_steps,
        )
