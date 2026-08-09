"""Pydantic models mirroring the authoritative curriculum.json schema.

These models are intentionally permissive about unknown fields (extra
data is ignored) but strict about the fields the interview engine
actually depends on, so a malformed curriculum file fails fast and
loudly instead of causing the LLM to hallucinate curriculum content.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class CurriculumModule(BaseModel):
    n: int
    title: str
    days: list[int] = Field(default_factory=list)


class CurriculumDay(BaseModel):
    day: int
    title: str
    type: str
    tools: list[str] = Field(default_factory=list)
    objectives: list[str] = Field(default_factory=list)


class Curriculum(BaseModel):
    cohort: str
    modules: list[CurriculumModule]
    days: list[CurriculumDay]

    def day_by_number(self, day: int) -> CurriculumDay | None:
        for d in self.days:
            if d.day == day:
                return d
        return None

    def module_for_day(self, day: int) -> CurriculumModule | None:
        for m in self.modules:
            if m.days and m.days[0] <= day <= m.days[-1]:
                return m
        return None
