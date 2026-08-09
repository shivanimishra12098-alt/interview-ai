"""Abstract LLM provider interface.

The interview engine depends only on this interface, never on a
concrete provider, so tests can run against MockLLMProvider without
any API key or network access.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from app.schemas.candidate import Candidate
from app.schemas.interview import (
    AnswerEvaluation,
    CandidateProfile,
    Difficulty,
    GeneratedQuestion,
    InterviewFeedback,
)


class LLMProviderError(Exception):
    """Raised when the LLM provider fails to produce a usable response."""


class LLMProvider(ABC):
    @abstractmethod
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
        ...

    @abstractmethod
    def evaluate_answer(
        self,
        *,
        question: GeneratedQuestion,
        answer: str,
        conversation_history: list[dict],
    ) -> AnswerEvaluation:
        ...

    @abstractmethod
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
        ...

    @abstractmethod
    def generate_feedback(
        self,
        *,
        candidate: Candidate,
        profile: CandidateProfile,
        asked_questions: list,
    ) -> InterviewFeedback:
        ...
