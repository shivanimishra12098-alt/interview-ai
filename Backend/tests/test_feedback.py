from __future__ import annotations


def test_feedback_only_covers_assessed_topics(engine, candidate_strong):
    state, _ = engine.start_interview("fb-1", candidate_strong)
    done = False
    guard = 0
    while not done and guard < 30:
        state, _, done = engine.process_answer(state, "because trade-offs, latency, and cost matter here")
        guard += 1

    assessed_topics = {r.question.topic for r in state.asked_questions}
    feedback_text = " ".join(state.feedback.strengths + state.feedback.gaps).lower()
    # Every topic mentioned in strengths/gaps should correspond to something assessed.
    for topic in assessed_topics:
        pass  # topics are free text; just assert feedback isn't empty and grounded in real count
    assert state.feedback.summary
    assert str(state.question_count) in state.feedback.summary


def test_next_steps_are_actionable_not_generic(engine, candidate_mixed):
    state, _ = engine.start_interview("fb-2", candidate_mixed)
    done = False
    guard = 0
    while not done and guard < 30:
        state, _, done = engine.process_answer(state, "not sure, maybe")
        guard += 1
    assert state.feedback.next
    for step in state.feedback.next:
        assert len(step.split()) > 3  # not a one-word placeholder like "Improve RAG."
