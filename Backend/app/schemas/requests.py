"""Wire-format request models for POST /api/interview.

The endpoint accepts two shapes on the same route, distinguished by
which optional field is present:
  - {"sessionId", "candidate"}  -> start a new interview
  - {"sessionId", "message"}    -> continue an existing interview
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, model_validator


class InterviewTurnRequest(BaseModel):
    sessionId: str
    candidate: dict[str, Any] | None = None
    message: str | None = None

    @model_validator(mode="after")
    def _exactly_one_payload(self) -> "InterviewTurnRequest":
        has_candidate = self.candidate is not None
        has_message = self.message is not None
        if not has_candidate and not has_message:
            raise ValueError("Request must include either 'candidate' (to start) or 'message' (to continue).")
        return self

    @property
    def is_start(self) -> bool:
        return self.candidate is not None
