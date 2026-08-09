"""Shared input validation helpers.

Centralizing validation keeps the API layer thin and makes the rules
easy to unit test independently of FastAPI.
"""
from __future__ import annotations

from app.config import get_settings


class ValidationError(Exception):
    """Raised when incoming request data fails validation."""

    def __init__(self, message: str, code: str = "VALIDATION_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code


def validate_session_id(session_id: str | None) -> str:
    if not session_id or not session_id.strip():
        raise ValidationError("sessionId is required and cannot be empty.", "MISSING_SESSION_ID")
    if len(session_id) > 128:
        raise ValidationError("sessionId is too long.", "INVALID_SESSION_ID")
    return session_id.strip()


def validate_message(message: str | None) -> str:
    settings = get_settings()
    if message is None:
        raise ValidationError("message is required for a conversation turn.", "MISSING_MESSAGE")
    stripped = message.strip()
    if not stripped:
        raise ValidationError("message cannot be empty or whitespace-only.", "EMPTY_MESSAGE")
    if len(message) > settings.max_message_length:
        raise ValidationError(
            f"message exceeds the maximum allowed length of {settings.max_message_length} characters.",
            "MESSAGE_TOO_LONG",
        )
    return stripped
