"""Internal domain models for candidate analysis and interview state.

These are NOT the wire-format request/response models (see
schemas/requests.py and schemas/responses.py) — they are the engine's
internal working representation, persisted as JSON in the database.
"""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Candidate profile (output of the candidate analyzer)
# ---------------------------------------------------------------------------

class TopicSignal(BaseModel):
    day: int
    title: str
    outcome: str  # passed | failed | skipped | unknown
    attempts: int | None = None


class CandidateProfile(BaseModel):
    experience_level: str  # junior | mid | senior | staff+
    strong_topics: list[TopicSignal] = Field(default_factory=list)
    developing_topics: list[TopicSignal] = Field(default_factory=list)
    weak_topics: list[TopicSignal] = Field(default_factory=list)
    skipped_topics: list[TopicSignal] = Field(default_factory=list)
    advanced_topics: list[TopicSignal] = Field(default_factory=list)
    recommended_topics: list[TopicSignal] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Question generation / evaluation
# ---------------------------------------------------------------------------

class QuestionType(str, Enum):
    conceptual = "conceptual"
    practical = "practical"
    implementation = "implementation"
    debugging = "debugging"
    architecture = "architecture"
    trade_off = "trade_off"
    scenario_based = "scenario_based"
    system_design = "system_design"


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class GeneratedQuestion(BaseModel):
    question: str
    curriculum_day: int
    topic: str
    difficulty: Difficulty
    question_type: QuestionType
    rationale: str
    is_follow_up: bool = False
    parent_question_index: int | None = None


class AnswerClassification(str, Enum):
    strong = "strong"
    adequate = "adequate"
    weak = "weak"
    incorrect = "incorrect"
    incomplete = "incomplete"


class AnswerEvaluation(BaseModel):
    score: int = Field(ge=0, le=10)
    classification: AnswerClassification
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    concepts_demonstrated: list[str] = Field(default_factory=list)
    concepts_missing: list[str] = Field(default_factory=list)
    incorrect_claims: list[str] = Field(default_factory=list)
    recommended_action: str = ""  # "increase_difficulty" | "follow_up" | "change_topic" | "clarify_fundamentals"


class AskedQuestionRecord(BaseModel):
    index: int
    question: GeneratedQuestion
    candidate_answer: str | None = None
    evaluation: AnswerEvaluation | None = None
    asked_at: datetime = Field(default_factory=_utcnow)


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

class InterviewFeedback(BaseModel):
    summary: str
    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)
    next: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Full interview state (persisted)
# ---------------------------------------------------------------------------

class InterviewPlanItem(BaseModel):
    curriculum_day: int
    topic: str
    reason: str


class InterviewState(BaseModel):
    session_id: str
    candidate_id: str
    candidate_raw: dict  # original candidate.json payload, kept for traceability
    candidate_profile: CandidateProfile

    question_count: int = 0
    follow_up_count: int = 0
    difficulty: Difficulty = Difficulty.medium

    current_curriculum_day: int | None = None
    current_topic: str | None = None

    covered_curriculum_days: list[int] = Field(default_factory=list)
    covered_topics: list[str] = Field(default_factory=list)

    interview_plan: list[InterviewPlanItem] = Field(default_factory=list)
    asked_questions: list[AskedQuestionRecord] = Field(default_factory=list)
    conversation_history: list[dict] = Field(default_factory=list)  # [{"role": "...", "content": "..."}]

    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)

    done: bool = False
    feedback: InterviewFeedback | None = None

    started_at: datetime = Field(default_factory=_utcnow)
    completed_at: datetime | None = None

    def add_message(self, role: str, content: str) -> None:
        self.conversation_history.append({"role": role, "content": content})
