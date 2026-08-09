"""Application configuration.

All configuration is read from environment variables. No secrets are
hard-coded. See .env.example for the full list of supported variables.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _csv_list(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    """Central application settings, populated from environment variables."""

    # --- LLM configuration ---
    llm_provider: str = os.getenv("LLM_PROVIDER", "mock")  # "mock" or "openai"
    llm_api_key: str | None = os.getenv("LLM_API_KEY")
    llm_base_url: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    llm_timeout_seconds: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "30"))

    # --- Interview rules (deterministic, not LLM-controlled) ---
    min_questions: int = int(os.getenv("MIN_QUESTIONS", "8"))
    min_curriculum_days: int = int(os.getenv("MIN_CURRICULUM_DAYS", "4"))
    max_questions: int = int(os.getenv("MAX_QUESTIONS", "12"))
    max_follow_ups_per_topic: int = int(os.getenv("MAX_FOLLOW_UPS_PER_TOPIC", "2"))

    # --- Data files ---
    curriculum_path: Path = BASE_DIR / "data" / "curriculum.json"
    candidates_path: Path = BASE_DIR / "data" / "candidates.json"

    # --- Database ---
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'interview.db'}")

    # --- Input limits ---
    max_message_length: int = int(os.getenv("MAX_MESSAGE_LENGTH", "4000"))

    # --- CORS ---
    cors_origins: list[str] = _csv_list(os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"))

    # --- Logging ---
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


@lru_cache
def get_settings() -> Settings:
    return Settings()
