"""Persistence layer between the interview engine and the database.

The engine works entirely with the Pydantic InterviewState. This
repository is the only place that translates that state to and from
SQLAlchemy rows, so persistence concerns never leak into engine logic.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.interview import InterviewMessage, InterviewQuestionRow, InterviewSession
from app.schemas.interview import AskedQuestionRecord, InterviewState


class InterviewRepository:
    def __init__(self, session: Session):
        self.session = session

    def get(self, session_id: str) -> InterviewState | None:
        row = self.session.get(InterviewSession, session_id)
        if row is None:
            return None
        return InterviewState.model_validate(row.state_json)

    def save(self, state: InterviewState, new_messages: list[dict] | None = None, new_question: AskedQuestionRecord | None = None) -> None:
        row = self.session.get(InterviewSession, state.session_id)
        state_json = state.model_dump(mode="json")

        if row is None:
            row = InterviewSession(
                id=state.session_id,
                candidate_id=state.candidate_id,
                state_json=state_json,
                done=state.done,
            )
            self.session.add(row)
        else:
            row.state_json = state_json
            row.done = state.done

        for msg in new_messages or []:
            self.session.add(InterviewMessage(session_id=state.session_id, role=msg["role"], content=msg["content"]))

        if new_question is not None:
            evaluation = new_question.evaluation.model_dump(mode="json") if new_question.evaluation else None
            self.session.add(
                InterviewQuestionRow(
                    session_id=state.session_id,
                    question_index=new_question.index,
                    curriculum_day=new_question.question.curriculum_day,
                    topic=new_question.question.topic,
                    question_type=new_question.question.question_type.value,
                    difficulty=new_question.question.difficulty.value,
                    question_text=new_question.question.question,
                    candidate_answer=new_question.candidate_answer,
                    evaluation_json=evaluation,
                )
            )

    def exists(self, session_id: str) -> bool:
        return self.session.get(InterviewSession, session_id) is not None

    def list_sessions(self) -> list[str]:
        return list(self.session.scalars(select(InterviewSession.id)))
