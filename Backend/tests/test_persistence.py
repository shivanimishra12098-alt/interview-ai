from __future__ import annotations

import tempfile
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.repositories.interview_repository import InterviewRepository
from app.storage.database import Base


@pytest.fixture()
def db_session():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = Path(tmp.name)

    db_url = f"sqlite:///{db_path}"
    engine = create_engine(db_url, connect_args={"check_same_thread": False}, future=True)
    from app.models import interview as _models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, future=True)
    session = Session()

    try:
        yield session
    finally:
        session.close()
        engine.dispose()
        db_path.unlink(missing_ok=True)


def test_save_and_load_round_trip(db_session, engine, candidate_strong):
    state, _ = engine.start_interview("persist-1", candidate_strong)
    repo = InterviewRepository(db_session)
    repo.save(state, new_messages=state.conversation_history)
    db_session.commit()

    reloaded = repo.get("persist-1")
    assert reloaded is not None
    assert reloaded.session_id == "persist-1"
    assert reloaded.question_count == state.question_count
    assert reloaded.candidate_id == state.candidate_id


def test_session_survives_across_repository_instances(db_session, engine, candidate_strong):
    state, _ = engine.start_interview("persist-2", candidate_strong)
    InterviewRepository(db_session).save(state, new_messages=state.conversation_history)
    db_session.commit()

    # Simulate a fresh request by creating a brand-new repository against the same session.
    repo2 = InterviewRepository(db_session)
    reloaded = repo2.get("persist-2")
    assert reloaded is not None

    state2, reply, done = engine.process_answer(reloaded, "because trade-offs and latency matter")
    repo2.save(state2, new_messages=state2.conversation_history[-2:])
    db_session.commit()

    repo3 = InterviewRepository(db_session)
    reloaded2 = repo3.get("persist-2")
    assert reloaded2.question_count == state2.question_count


def test_nonexistent_session_returns_none(db_session):
    repo = InterviewRepository(db_session)
    assert repo.get("does-not-exist") is None


def test_exists_reflects_saved_state(db_session, engine, candidate_strong):
    repo = InterviewRepository(db_session)
    assert repo.exists("persist-3") is False
    state, _ = engine.start_interview("persist-3", candidate_strong)
    repo.save(state, new_messages=state.conversation_history)
    db_session.commit()
    assert repo.exists("persist-3") is True
