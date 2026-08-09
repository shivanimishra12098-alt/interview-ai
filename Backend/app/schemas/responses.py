"""Wire-format response models for POST /api/interview.

These deliberately mirror technical-spec.md field-for-field. Do not
add required fields here without updating the spec.
"""
from __future__ import annotations

from pydantic import BaseModel

from app.schemas.interview import InterviewFeedback


class InterviewTurnResponse(BaseModel):
    reply: str
    done: bool
    feedback: InterviewFeedback | None = None

    class Config:
        # Omit "feedback" entirely from the JSON body unless it is set,
        # matching the spec's in-progress response shape exactly.
        pass

    def to_wire(self) -> dict:
        data = {"reply": self.reply, "done": self.done}
        if self.feedback is not None:
            data["feedback"] = self.feedback.model_dump()
        return data


class ErrorResponse(BaseModel):
    error: str
    code: str = "ERROR"
