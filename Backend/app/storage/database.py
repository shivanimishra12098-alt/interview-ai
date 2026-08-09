"""SQLAlchemy engine and session management."""
from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _make_engine():
    settings = get_settings()
    connect_args = {}
    poolclass = None
    if settings.database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        if settings.database_url == "sqlite:///:memory:" or settings.database_url.startswith("sqlite:///:memory:"):
            poolclass = StaticPool
    return create_engine(settings.database_url, connect_args=connect_args, future=True, poolclass=poolclass)


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def init_db() -> None:
    """Create all tables. Safe to call multiple times."""
    # Import models so they register on Base.metadata before create_all.
    from app.models import interview as _interview_models  # noqa: F401

    with engine.begin() as connection:
        Base.metadata.create_all(bind=connection)


@contextmanager
def get_session() -> Iterator[Session]:
    with SessionLocal.begin() as session:
        yield session
