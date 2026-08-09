from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import health, interview
from app.config import get_settings
from app.storage.database import init_db
from app.utils.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)

app = FastAPI(title="AI Interview Agent", version="1.0.0")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    logger.info("AI Interview Agent started; database initialized.")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Last-resort safety net: never leak stack traces to the client.
    logger.exception("Unhandled exception on %s", request.url.path)
    return JSONResponse(status_code=500, content={"error": "An unexpected error occurred.", "code": "INTERNAL_ERROR"})


app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(interview.router, prefix="/api", tags=["interview"])
