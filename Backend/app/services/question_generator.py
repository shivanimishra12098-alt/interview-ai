"""Generates interview questions, enforcing curriculum grounding and
deduplication at the application layer (never trusting the LLM alone).
"""
from __future__ import annotations

from app.llm.provider import LLMProvider
from app.schemas.candidate import Candidate
from app.schemas.interview import CandidateProfile, Difficulty, GeneratedQuestion
from app.services.curriculum_service import CurriculumService


class QuestionGenerationError(Exception):
    pass


def generate_question(
    *,
    llm: LLMProvider,
    curriculum: CurriculumService,
    candidate: Candidate,
    profile: CandidateProfile,
    curriculum_day: int,
    topic: str,
    difficulty: Difficulty,
    conversation_history: list[dict],
    previously_asked: list[str],
) -> GeneratedQuestion:
    day = curriculum.require_day(curriculum_day)  # raises if day is invalid -- never let the LLM invent one

    question = llm.generate_question(
        candidate=candidate,
        profile=profile,
        curriculum_day=day,
        topic=topic,
        difficulty=difficulty,
        conversation_history=conversation_history,
        avoid_questions=previously_asked,
    )

    # Deterministic enforcement: reject duplicates and re-ground the day,
    # regardless of what the LLM/mock returned.
    question.curriculum_day = day.day
    if question.question.strip() in {q.strip() for q in previously_asked}:
        raise QuestionGenerationError("Generated question duplicates a previously asked question.")
    return question
