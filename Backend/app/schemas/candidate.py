"""Pydantic models mirroring the authoritative candidates.json schema.

A single candidate record uses this shape:

{
  "member": { "id", "name", "jobRole", "yearsExperience", "education", "status" },
  "missions": [ { "day", "title", "passed"?, "attempts"?, "skipped"? }, ... ],
  "signals": { "commitDays", "missionsCompleted", "missionsFirstTry" }
}
"""
from __future__ import annotations

from pydantic import BaseModel, Field, model_validator


class CandidateMember(BaseModel):
    id: str
    name: str
    jobRole: str
    yearsExperience: int
    education: str
    status: str


class CandidateMission(BaseModel):
    day: int
    title: str
    passed: bool | None = None
    attempts: int | None = None
    skipped: bool = False

    @model_validator(mode="after")
    def _normalize(self) -> "CandidateMission":
        # A mission is either skipped, or has an explicit pass/fail result.
        if self.skipped:
            self.passed = None
        return self

    @property
    def outcome(self) -> str:
        """One of: 'skipped', 'passed', 'failed', 'unknown'."""
        if self.skipped:
            return "skipped"
        if self.passed is True:
            return "passed"
        if self.passed is False:
            return "failed"
        return "unknown"


class CandidateSignals(BaseModel):
    commitDays: int = 0
    missionsCompleted: int = 0
    missionsFirstTry: int = 0


class Candidate(BaseModel):
    member: CandidateMember
    missions: list[CandidateMission] = Field(default_factory=list)
    signals: CandidateSignals = Field(default_factory=CandidateSignals)
