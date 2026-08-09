"""OpenAI-compatible LLMProvider implementation.

Works against the OpenAI API itself or any OpenAI-compatible endpoint
(e.g. a local vLLM/Ollama proxy) via LLM_BASE_URL. Requests structured
JSON output and validates it against the Pydantic schemas before
returning -- a malformed LLM response raises LLMProviderError rather
than silently corrupting interview state.
"""
from __future__ import annotations

import json
from typing import Any

import httpx

from app.config import get_settings
from app.llm import prompts
from app.llm.provider import LLMProvider, LLMProviderError
from app.schemas.candidate import Candidate
from app.schemas.interview import (
    AnswerEvaluation,
    CandidateProfile,
    Difficulty,
    GeneratedQuestion,
    InterviewFeedback,
)
from app.utils.logging import get_logger

logger = get_logger(__name__)

_QUESTION_SCHEMA_HINT = """
Respond with ONLY this JSON shape (no markdown fences, no extra text):
{
  "question": "string",
  "difficulty": "easy|medium|hard",
  "question_type": "conceptual|practical|implementation|debugging|architecture|trade_off|scenario_based|system_design",
  "rationale": "string"
}
"""

_EVALUATION_SCHEMA_HINT = """
Respond with ONLY this JSON shape (no markdown fences, no extra text):
{
  "score": 0-10,
  "classification": "strong|adequate|weak|incorrect|incomplete",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "concepts_demonstrated": ["string"],
  "concepts_missing": ["string"],
  "incorrect_claims": ["string"],
  "recommended_action": "increase_difficulty|follow_up|change_topic|clarify_fundamentals"
}
"""

_FEEDBACK_SCHEMA_HINT = """
Respond with ONLY this JSON shape (no markdown fences, no extra text):
{
  "summary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "next": ["string"]
}
"""


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str | None = None, base_url: str | None = None, model: str | None = None, timeout: float | None = None):
        settings = get_settings()
        self.api_key = api_key or settings.llm_api_key
        self.base_url = (base_url or settings.llm_base_url).rstrip("/")
        self.model = model or settings.llm_model
        self.timeout = timeout or settings.llm_timeout_seconds
        if not self.api_key:
            raise LLMProviderError("LLM_API_KEY is not configured.")

    # -- low level ------------------------------------------------------
    def _chat(self, system: str, user: str) -> dict[str, Any]:
        try:
            response = httpx.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "temperature": 0.4,
                    "response_format": {"type": "json_object"},
                },
                timeout=self.timeout,
            )
            response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise LLMProviderError(f"LLM request timed out after {self.timeout}s.") from exc
        except httpx.HTTPStatusError as exc:
            raise LLMProviderError(f"LLM request failed with status {exc.response.status_code}.") from exc
        except httpx.HTTPError as exc:
            raise LLMProviderError(f"LLM request failed: {exc}") from exc

        try:
            body = response.json()
            content = body["choices"][0]["message"]["content"]
            return json.loads(content)
        except (KeyError, IndexError, json.JSONDecodeError, TypeError) as exc:
            raise LLMProviderError(f"LLM returned a malformed response: {exc}") from exc

    # -- interface --------------------------------------------------
    def generate_question(self, *, candidate: Candidate, profile: CandidateProfile, curriculum_day, topic, difficulty, conversation_history, avoid_questions) -> GeneratedQuestion:
        system = prompts.question_generation_prompt() + _QUESTION_SCHEMA_HINT
        user = json.dumps({
            "candidate_role": candidate.member.jobRole,
            "candidate_experience_level": profile.experience_level,
            "curriculum_day": curriculum_day.day,
            "curriculum_day_title": curriculum_day.title,
            "curriculum_objectives": curriculum_day.objectives,
            "curriculum_tools": curriculum_day.tools,
            "topic": topic,
            "requested_difficulty": difficulty.value,
            "previously_asked_questions": avoid_questions,
            "conversation_history": conversation_history[-6:],
        })
        data = self._chat(system, user)
        try:
            return GeneratedQuestion(
                question=data["question"],
                curriculum_day=curriculum_day.day,
                topic=topic,
                difficulty=Difficulty(data.get("difficulty", difficulty.value)),
                question_type=data["question_type"],
                rationale=data.get("rationale", ""),
            )
        except Exception as exc:
            raise LLMProviderError(f"LLM question response failed validation: {exc}") from exc

    def evaluate_answer(self, *, question: GeneratedQuestion, answer: str, conversation_history: list[dict]) -> AnswerEvaluation:
        system = prompts.answer_evaluation_prompt() + _EVALUATION_SCHEMA_HINT
        user = json.dumps({
            "question": question.question,
            "topic": question.topic,
            "curriculum_day": question.curriculum_day,
            "candidate_answer": answer,
            "conversation_history": conversation_history[-6:],
        })
        data = self._chat(system, user)
        try:
            return AnswerEvaluation.model_validate(data)
        except Exception as exc:
            raise LLMProviderError(f"LLM evaluation response failed validation: {exc}") from exc

    def generate_follow_up(self, *, candidate: Candidate, profile: CandidateProfile, original_question: GeneratedQuestion, answer: str, evaluation: AnswerEvaluation, conversation_history: list[dict]) -> GeneratedQuestion:
        system = prompts.follow_up_prompt() + _QUESTION_SCHEMA_HINT
        user = json.dumps({
            "original_question": original_question.question,
            "topic": original_question.topic,
            "curriculum_day": original_question.curriculum_day,
            "candidate_answer": answer,
            "evaluation": evaluation.model_dump(mode="json"),
            "conversation_history": conversation_history[-6:],
        })
        data = self._chat(system, user)
        try:
            return GeneratedQuestion(
                question=data["question"],
                curriculum_day=original_question.curriculum_day,
                topic=original_question.topic,
                difficulty=Difficulty(data.get("difficulty", original_question.difficulty.value)),
                question_type=data["question_type"],
                rationale=data.get("rationale", ""),
                is_follow_up=True,
            )
        except Exception as exc:
            raise LLMProviderError(f"LLM follow-up response failed validation: {exc}") from exc

    def generate_feedback(self, *, candidate: Candidate, profile: CandidateProfile, asked_questions: list) -> InterviewFeedback:
        system = prompts.feedback_generation_prompt() + _FEEDBACK_SCHEMA_HINT
        user = json.dumps({
            "candidate_name": candidate.member.name,
            "candidate_role": candidate.member.jobRole,
            "experience_level": profile.experience_level,
            "questions_asked": [
                {
                    "question": r.question.question,
                    "topic": r.question.topic,
                    "curriculum_day": r.question.curriculum_day,
                    "answer": r.candidate_answer,
                    "evaluation": r.evaluation.model_dump(mode="json") if r.evaluation else None,
                }
                for r in asked_questions
            ],
        })
        data = self._chat(system, user)
        try:
            return InterviewFeedback.model_validate(data)
        except Exception as exc:
            raise LLMProviderError(f"LLM feedback response failed validation: {exc}") from exc
