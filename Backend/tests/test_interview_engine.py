from __future__ import annotations

import pytest

from app.services.interview_engine import InterviewEngineError


def _run_full_interview(engine, candidate_raw, session_id="sess-1", answer="I think you'd increase top-k, maybe."):
    state, reply = engine.start_interview(session_id, candidate_raw)
    assert reply
    done = False
    guard = 0
    while not done and guard < 30:
        state, reply, done = engine.process_answer(state, answer)
        guard += 1
    assert guard < 30, "interview never terminated"
    return state, reply, done


def test_start_interview_produces_first_question(engine, candidate_strong):
    state, reply = engine.start_interview("s1", candidate_strong)
    assert state.question_count == 1
    assert len(state.asked_questions) == 1
    assert reply


def test_minimum_8_questions_enforced(engine, candidate_strong):
    state, _, done = _run_full_interview(engine, candidate_strong, session_id="s2")
    assert done is True
    assert state.question_count >= 8


def test_minimum_4_curriculum_days_enforced(engine, candidate_strong):
    state, _, _ = _run_full_interview(engine, candidate_strong, session_id="s3")
    assert len(set(state.covered_curriculum_days)) >= 4


def test_maximum_question_termination(engine, candidate_strong):
    state, _, done = _run_full_interview(engine, candidate_strong, session_id="s4", answer="I'm not sure, maybe?")
    assert done is True
    assert state.question_count <= engine.settings.max_questions


def test_question_deduplication(engine, candidate_strong):
    state, _, _ = _run_full_interview(engine, candidate_strong, session_id="s5")
    texts = [r.question.question for r in state.asked_questions]
    assert len(texts) == len(set(texts)), "duplicate question text was asked"


def test_thin_candidate_still_reaches_minimums(engine, candidate_thin):
    state, _, done = _run_full_interview(engine, candidate_thin, session_id="s6")
    assert done is True
    assert state.question_count >= 8
    assert len(set(state.covered_curriculum_days)) >= 4


def test_skipped_topics_never_treated_as_attempted(engine, candidate_mixed):
    state, _, _ = _run_full_interview(engine, candidate_mixed, session_id="s7")
    skipped_days = {t.day for t in state.candidate_profile.skipped_topics}
    strong_days = {t.day for t in state.candidate_profile.strong_topics}
    assert skipped_days.isdisjoint(strong_days)


def test_processing_answer_before_start_raises(engine):
    from app.schemas.interview import CandidateProfile, InterviewState

    state = InterviewState(
        session_id="never-started",
        candidate_id="X",
        candidate_raw={},
        candidate_profile=CandidateProfile(experience_level="mid"),
    )
    with pytest.raises(InterviewEngineError):
        engine.process_answer(state, "hello")


def test_processing_answer_after_completion_raises(engine, candidate_strong):
    state, _, done = _run_full_interview(engine, candidate_strong, session_id="s8")
    assert done is True
    with pytest.raises(InterviewEngineError):
        engine.process_answer(state, "one more answer")


def test_final_response_includes_feedback(engine, candidate_strong):
    state, _, done = _run_full_interview(engine, candidate_strong, session_id="s9")
    assert done is True
    assert state.feedback is not None
    assert state.feedback.summary
    assert isinstance(state.feedback.strengths, list)
    assert isinstance(state.feedback.gaps, list)
    assert isinstance(state.feedback.next, list)
