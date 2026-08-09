"""SQLAlchemy ORM models.

The interview engine's rich internal state (InterviewState, a Pydantic
model) is stored as a single JSON blob in InterviewSession.state_json.
This keeps persistence simple for a hackathon timeline while still
satisfying "the interview should survive server restart." Individual
message/question/evaluation rows are also written for auditability and
so they can be queried/reported on independently of the JSON blob.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.storage.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)  # sessionId
    candidate_id: Mapped[str] = mapped_column(String(64), index=True)
    state_json: Mapped[dict] = mapped_column(JSON)  # full InterviewState.model_dump(mode="json")
    done: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    messages: Mapped[list["InterviewMessage"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    questions: Mapped[list["InterviewQuestionRow"]] = relationship(back_populates="session", cascade="all, delete-orphan")


class InterviewMessage(Base):
    __tablename__ = "interview_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("interview_sessions.id"), index=True)
    role: Mapped[str] = mapped_column(String(16))  # "interviewer" | "candidate"
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    session: Mapped[InterviewSession] = relationship(back_populates="messages")


class InterviewQuestionRow(Base):
    __tablename__ = "interview_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("interview_sessions.id"), index=True)
    question_index: Mapped[int] = mapped_column(Integer)
    curriculum_day: Mapped[int] = mapped_column(Integer)
    topic: Mapped[str] = mapped_column(String(256))
    question_type: Mapped[str] = mapped_column(String(32))
    difficulty: Mapped[str] = mapped_column(String(16))
    question_text: Mapped[str] = mapped_column(Text)
    candidate_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    evaluation_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    session: Mapped[InterviewSession] = relationship(back_populates="questions")
