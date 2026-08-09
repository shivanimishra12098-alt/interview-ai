from __future__ import annotations

import pytest

from app.services.curriculum_service import CurriculumValidationError


def test_loads_all_31_days(curriculum):
    assert len(curriculum.days) == 31


def test_get_valid_day(curriculum):
    day = curriculum.get_day(7)
    assert day is not None
    assert day.title == "Embeddings Explained"


def test_invalid_day_returns_none(curriculum):
    assert curriculum.get_day(999) is None


def test_require_invalid_day_raises(curriculum):
    with pytest.raises(CurriculumValidationError):
        curriculum.require_day(999)


def test_search_days_finds_matches(curriculum):
    results = curriculum.search_days("RAG")
    assert any(d.day == 11 for d in results)
