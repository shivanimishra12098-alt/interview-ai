from __future__ import annotations

import json
import os
import random
from pathlib import Path

import pytest

os.environ.setdefault("LLM_PROVIDER", "mock")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from app.config import get_settings  # noqa: E402
from app.llm.mock_provider import MockLLMProvider  # noqa: E402
from app.services.curriculum_service import CurriculumService  # noqa: E402
from app.services.interview_engine import InterviewEngine  # noqa: E402

FIXTURES_DIR = Path(__file__).parent.parent / "data"


@pytest.fixture()
def curriculum():
    return CurriculumService.from_file(FIXTURES_DIR / "curriculum.json")


@pytest.fixture()
def candidates_raw():
    fixture_path = FIXTURES_DIR / "candidates.json"
    with fixture_path.open(encoding="utf-8") as handle:
        return json.load(handle)["candidates"]


@pytest.fixture()
def candidate_strong(candidates_raw):
    # Emily Chen, CAND-003 -- near-perfect first-try record.
    return next(c for c in candidates_raw if c["member"]["id"] == "CAND-003")


@pytest.fixture()
def candidate_mixed(candidates_raw):
    # David Miller, CAND-004 -- passes, but many attempts + a skip.
    return next(c for c in candidates_raw if c["member"]["id"] == "CAND-004")


@pytest.fixture()
def candidate_thin():
    # Minimal candidate with very little mission history, to exercise
    # the fallback / "ensure topic diversity" path.
    return {
        "member": {
            "id": "CAND-THIN",
            "name": "Casey Thin",
            "jobRole": "Software Engineer",
            "yearsExperience": 2,
            "education": "BS Computer Science",
            "status": "COMPLETED",
        },
        "missions": [
            {"day": 7, "title": "Embeddings Explained", "passed": True, "attempts": 1},
        ],
        "signals": {"commitDays": 5, "missionsCompleted": 1, "missionsFirstTry": 1},
    }


@pytest.fixture()
def engine(curriculum):
    settings = get_settings()
    return InterviewEngine(llm=MockLLMProvider(seed=1), curriculum=curriculum, settings=settings, rng=random.Random(1))
