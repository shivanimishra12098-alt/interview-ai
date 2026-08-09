"""Generates final structured interview feedback via the LLM provider."""
from __future__ import annotations

from app.llm.provider import LLMProvider
from app.schemas.candidate import Candidate
from app.schemas.interview import AskedQuestionRecord, CandidateProfile, InterviewFeedback


def generate_feedback(
    *,
    llm: LLMProvider,
    candidate: Candidate,
    profile: CandidateProfile,
    asked_questions: list[AskedQuestionRecord],
) -> InterviewFeedback:
    return llm.generate_feedback(candidate=candidate, profile=profile, asked_questions=asked_questions)
