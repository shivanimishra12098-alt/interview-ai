"""POST /api/interview -- the sole endpoint defined by technical-spec.md."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError as PydanticValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.config import get_settings
from app.llm.factory import get_llm_provider
from app.repositories.interview_repository import InterviewRepository
from app.schemas.requests import InterviewTurnRequest
from app.schemas.responses import InterviewTurnResponse
from app.services.curriculum_service import get_curriculum_service
from app.services.interview_engine import InterviewEngine, InterviewEngineError
from app.storage.database import get_session
from app.utils.logging import get_logger
from app.utils.validation import ValidationError, validate_message, validate_session_id

router = APIRouter()
logger = get_logger(__name__)


@router.post("/interview")
def interview_turn(payload: InterviewTurnRequest) -> dict:
    try:
        session_id = validate_session_id(payload.sessionId)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.message)

    settings = get_settings()
    curriculum = get_curriculum_service()
    llm = get_llm_provider()
    engine = InterviewEngine(llm=llm, curriculum=curriculum, settings=settings)

    try:
        with get_session() as db:
            repo = InterviewRepository(db)
            existing = repo.get(session_id)

            if payload.is_start:
                if existing is not None:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Session '{session_id}' already exists. Use 'message' to continue it.",
                    )
                if not payload.candidate:
                    raise HTTPException(status_code=400, detail="candidate payload is required to start an interview.")
                try:
                    state, reply = engine.start_interview(session_id, payload.candidate)
                except InterviewEngineError as exc:
                    raise HTTPException(status_code=422, detail=str(exc)) from exc
                except (TypeError, ValueError, AttributeError, KeyError) as exc:
                    logger.warning("Invalid candidate payload for session %s: %s", session_id, exc)
                    raise HTTPException(status_code=422, detail="candidate payload failed validation.") from exc
                repo.save(state, new_messages=state.conversation_history)
                response = InterviewTurnResponse(reply=reply, done=False)
                response_payload = response.to_wire()
                return {**response_payload, "done": response_payload.get("done", False)}

            # -- continuation turn -----------------------------------
            if existing is None:
                raise HTTPException(status_code=404, detail=f"No interview session found for sessionId '{session_id}'.")
            if getattr(existing, "done", False):
                raise HTTPException(status_code=409, detail="This interview has already been completed.")

            try:
                message = validate_message(payload.message)
            except ValidationError as exc:
                raise HTTPException(status_code=400, detail=exc.message) from exc

            try:
                state, reply, done = engine.process_answer(existing, message)
            except InterviewEngineError as exc:
                raise HTTPException(status_code=422, detail=str(exc)) from exc
            except (TypeError, ValueError, AttributeError, KeyError) as exc:
                logger.warning("Invalid continuation payload for session %s: %s", session_id, exc)
                raise HTTPException(status_code=422, detail="message payload failed validation.") from exc

            repo.save(state, new_messages=state.conversation_history[-2:])
            response = InterviewTurnResponse(reply=reply, done=done, feedback=state.feedback if done else None)
            response_payload = response.to_wire()
            return {**response_payload, "done": response_payload.get("done", False)}

    except HTTPException:
        raise
    except PydanticValidationError as exc:
        logger.warning("Payload validation failed for session %s: %s", session_id, exc)
        raise HTTPException(status_code=400, detail="Request payload failed validation.")
    except SQLAlchemyError as exc:
        logger.error("Database error for session %s: %s", session_id, exc)
        raise HTTPException(status_code=500, detail="A database error occurred. Please try again.")
    except Exception as exc:  # never leak stack traces to the client
        logger.exception("Unhandled error for session %s", session_id)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
