"""Loads and validates curriculum.json, and provides lookups.

This is the single source of truth for curriculum content. Nothing
downstream (question generator, LLM prompts) is allowed to invent a
curriculum day, topic, tool, or objective that isn't returned from
here.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from app.config import get_settings
from app.schemas.curriculum import Curriculum, CurriculumDay


class CurriculumValidationError(Exception):
    pass


class CurriculumService:
    def __init__(self, curriculum: Curriculum):
        self._curriculum = curriculum
        self._by_day = {d.day: d for d in curriculum.days}

    # -- loading -----------------------------------------------------
    @classmethod
    def from_file(cls, path: Path) -> "CurriculumService":
        if not path.exists():
            raise CurriculumValidationError(f"Curriculum file not found: {path}")
        try:
            raw = json.loads(path.read_text())
        except json.JSONDecodeError as exc:
            raise CurriculumValidationError(f"Curriculum file is not valid JSON: {exc}") from exc
        try:
            curriculum = Curriculum.model_validate(raw)
        except Exception as exc:  # pydantic.ValidationError
            raise CurriculumValidationError(f"Curriculum file failed schema validation: {exc}") from exc
        if not curriculum.days:
            raise CurriculumValidationError("Curriculum file contains no days.")
        return cls(curriculum)

    # -- lookups -------------------------------------------------------
    @property
    def cohort(self) -> str:
        return self._curriculum.cohort

    @property
    def modules(self):
        return self._curriculum.modules

    @property
    def days(self) -> list[CurriculumDay]:
        return self._curriculum.days

    def get_day(self, day: int) -> CurriculumDay | None:
        return self._by_day.get(day)

    def require_day(self, day: int) -> CurriculumDay:
        d = self.get_day(day)
        if d is None:
            raise CurriculumValidationError(f"Curriculum day {day} does not exist.")
        return d

    def is_valid_day(self, day: int) -> bool:
        return day in self._by_day

    def is_valid_topic(self, day: int, topic: str) -> bool:
        """A 'topic' for a day is considered valid if it matches the day's
        title, or one of its objectives/tools (case-insensitive substring),
        so LLM-phrased topics grounded in the day still validate."""
        d = self.get_day(day)
        if d is None:
            return False
        haystacks = [d.title, *d.objectives, *d.tools]
        needle = topic.strip().lower()
        return any(needle in h.lower() or h.lower() in needle for h in haystacks)

    def module_for_day(self, day: int):
        return self._curriculum.module_for_day(day)

    def search_days(self, query: str) -> list[CurriculumDay]:
        q = query.lower()
        return [
            d for d in self.days
            if q in d.title.lower()
            or any(q in o.lower() for o in d.objectives)
            or any(q in t.lower() for t in d.tools)
        ]

    def all_day_numbers(self) -> list[int]:
        return sorted(self._by_day.keys())


@lru_cache
def get_curriculum_service() -> CurriculumService:
    settings = get_settings()
    return CurriculumService.from_file(settings.curriculum_path)
