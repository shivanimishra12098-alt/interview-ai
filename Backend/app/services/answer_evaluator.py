"""Evaluates a candidate's answer via the LLM provider."""
from __future__ import annotations

from app.llm.provider import LLMProvider
from app.schemas.interview import AnswerEvaluation, GeneratedQuestion


def evaluate_answer(
    *,
    llm: LLMProvider,
    question: GeneratedQuestion,
    answer: str,
    conversation_history: list[dict],
) -> AnswerEvaluation:
    return llm.evaluate_answer(question=question, answer=answer, conversation_history=conversation_history)
