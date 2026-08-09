from __future__ import annotations

from app.schemas.candidate import Candidate
from app.services.candidate_analyzer import build_candidate_profile


def test_first_try_pass_is_strength(candidate_strong):
    candidate = Candidate.model_validate(candidate_strong)
    profile = build_candidate_profile(candidate)
    strong_days = {s.day for s in profile.strong_topics}
    assert 7 in strong_days  # Emily passed day 7 on attempt 1


def test_many_attempts_pass_is_developing(candidate_mixed):
    candidate = Candidate.model_validate(candidate_mixed)
    profile = build_candidate_profile(candidate)
    developing_days = {s.day for s in profile.developing_topics}
    # David passed day 8 in 5 attempts and day 23 in 5 attempts
    assert 8 in developing_days
    assert 23 in developing_days


def test_skipped_topic_is_not_assumed_mastery_or_weakness(candidate_mixed):
    candidate = Candidate.model_validate(candidate_mixed)
    profile = build_candidate_profile(candidate)
    skipped_days = {s.day for s in profile.skipped_topics}
    assert 28 in skipped_days
    assert 28 not in {s.day for s in profile.strong_topics}
    assert 28 not in {s.day for s in profile.weak_topics}
    assert 28 not in {s.day for s in profile.developing_topics}


def test_failed_topic_is_weakness_signal():
    raw = {
        "member": {"id": "X", "name": "X", "jobRole": "Eng", "yearsExperience": 3, "education": "BS", "status": "COMPLETED"},
        "missions": [{"day": 7, "title": "Embeddings Explained", "passed": False, "attempts": 4}],
        "signals": {"commitDays": 5, "missionsCompleted": 1, "missionsFirstTry": 0},
    }
    candidate = Candidate.model_validate(raw)
    profile = build_candidate_profile(candidate)
    assert any(s.day == 7 for s in profile.weak_topics)


def test_experience_level_mapping():
    for years, expected in [(0, "junior"), (2, "junior"), (5, "mid"), (10, "senior"), (20, "staff+")]:
        raw = {
            "member": {"id": "X", "name": "X", "jobRole": "Eng", "yearsExperience": years, "education": "BS", "status": "COMPLETED"},
            "missions": [],
            "signals": {"commitDays": 0, "missionsCompleted": 0, "missionsFirstTry": 0},
        }
        candidate = Candidate.model_validate(raw)
        profile = build_candidate_profile(candidate)
        assert profile.experience_level == expected


def test_does_not_invent_missions_not_present():
    raw = {
        "member": {"id": "X", "name": "X", "jobRole": "Eng", "yearsExperience": 3, "education": "BS", "status": "COMPLETED"},
        "missions": [{"day": 7, "title": "Embeddings Explained", "passed": True, "attempts": 1}],
        "signals": {"commitDays": 1, "missionsCompleted": 1, "missionsFirstTry": 1},
    }
    candidate = Candidate.model_validate(raw)
    profile = build_candidate_profile(candidate)
    all_days = {s.day for s in profile.strong_topics + profile.weak_topics + profile.developing_topics + profile.skipped_topics}
    assert all_days == {7}
