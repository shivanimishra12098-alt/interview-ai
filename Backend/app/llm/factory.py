"""Factory that returns the configured LLMProvider implementation."""
from __future__ import annotations

from functools import lru_cache

from app.config import get_settings
from app.llm.mock_provider import MockLLMProvider
from app.llm.provider import LLMProvider


@lru_cache
def get_llm_provider() -> LLMProvider:
    settings = get_settings()
    if settings.llm_provider == "openai":
        from app.llm.openai_provider import OpenAIProvider  # local import: httpx only needed here
        return OpenAIProvider()
    return MockLLMProvider()
