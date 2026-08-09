from __future__ import annotations

from app.schemas.interview import Difficulty


def test_weak_answer_triggers_follow_up_on_same_topic(engine, candidate_strong):
    state, _ = engine.start_interview("adapt-1", candidate_strong)
    topic_before = state.current_topic
    state, reply, done = engine.process_answer(state, "not sure")
    assert done is False
    assert state.current_topic == topic_before  # follow-up stays on topic
    assert state.follow_up_count == 1


def test_strong_answer_increases_difficulty(engine, candidate_strong):
    state, _ = engine.start_interview("adapt-2", candidate_strong)
    strong_answer = (
        "Because of the latency and cost trade-offs, I'd first check chunking and reranking quality, "
        "then measure precision and recall separately, benchmark throughput, and monitor cache hit rate "
        "before scaling."
    )
    difficulty_before = state.difficulty
    state, reply, done = engine.process_answer(state, strong_answer)
    order = [Difficulty.easy, Difficulty.medium, Difficulty.hard]
    assert order.index(state.difficulty) >= order.index(difficulty_before)


def test_generic_can_you_explain_more_never_used(engine, candidate_strong):
    state, _ = engine.start_interview("adapt-3", candidate_strong)
    for _ in range(6):
        state, reply, done = engine.process_answer(state, "not sure")
        if done:
            break
    all_questions = [r.question.question.lower() for r in state.asked_questions]
    assert not any(q.strip() == "can you explain more?" for q in all_questions)


def test_follow_up_count_capped_per_topic(engine, candidate_strong):
    state, _ = engine.start_interview("adapt-4", candidate_strong)
    for _ in range(10):
        state, reply, done = engine.process_answer(state, "not sure")
        if done:
            break
    assert state.follow_up_count <= engine.settings.max_follow_ups_per_topic
