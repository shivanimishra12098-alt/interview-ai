#!/usr/bin/env python3
"""Runs a complete, real (non-faked) interview end to end using
MockLLMProvider, so it works with no API key and no network access.

Usage:
    python scripts/demo.py [CANDIDATE_ID]

If CANDIDATE_ID is omitted, uses CAND-004 (David Miller) -- a mixed
record with strengths, a weak spot, and a skipped mission, which
exercises adaptive behavior well.
"""
from __future__ import annotations

import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import os
os.environ.setdefault("LLM_PROVIDER", "mock")
os.environ.setdefault("DATABASE_URL", "sqlite:///./demo_interview.db")

from app.config import get_settings
from app.llm.mock_provider import MockLLMProvider
from app.services.curriculum_service import CurriculumService
from app.services.interview_engine import InterviewEngine

ROOT = Path(__file__).resolve().parent.parent

# A small bank of varied canned candidate answers so the mock evaluator
# sees a realistic mix of strong / weak / adequate responses, exercising
# difficulty adaptation and follow-up behavior.
_ANSWER_BANK = [
    "I'd start by separating the problem: check chunking quality, embedding "
    "quality, top-k selection, reranking, and grounding evaluation separately, "
    "because conflating them wastes time. Trade-off wise, larger top-k costs "
    "more latency and money for marginal recall gains.",
    "I think you'd just increase top-k.",
    "Not totally sure, maybe restart the service?",
    "I'd add caching for repeated queries, monitor latency and cost per "
    "request, and benchmark before and after to prove the change helped at "
    "scale.",
    "I'd design it with clear separation of retrieval and generation, add "
    "timeouts and retries around the LLM call, and make sure failures degrade "
    "gracefully instead of hanging the whole pipeline.",
    "Honestly not sure how I'd debug that.",
]


def main() -> None:
    candidate_id = sys.argv[1] if len(sys.argv) > 1 else "CAND-004"

    candidates = json.loads((ROOT / "data" / "candidates.json").read_text())["candidates"]
    candidate_raw = next((c for c in candidates if c["member"]["id"] == candidate_id), None)
    if candidate_raw is None:
        print(f"Candidate '{candidate_id}' not found in data/candidates.json")
        sys.exit(1)

    curriculum = CurriculumService.from_file(ROOT / "data" / "curriculum.json")
    settings = get_settings()
    engine = InterviewEngine(llm=MockLLMProvider(seed=7), curriculum=curriculum, settings=settings, rng=random.Random(7))

    print(f"=== Starting interview for {candidate_raw['member']['name']} ({candidate_id}) ===\n")
    state, reply = engine.start_interview(f"demo-{candidate_id}", candidate_raw)
    print(f"INTERVIEWER: {reply}\n")

    done = False
    turn = 0
    while not done:
        answer = _ANSWER_BANK[turn % len(_ANSWER_BANK)]
        print(f"CANDIDATE: {answer}\n")
        state, reply, done = engine.process_answer(state, answer)
        print(f"INTERVIEWER: {reply}\n")
        turn += 1
        if turn > 20:
            print("Safety guard hit -- stopping demo loop.")
            break

    print("=== Interview complete ===")
    print(f"Total questions asked: {state.question_count}")
    print(f"Distinct curriculum days covered: {sorted(set(state.covered_curriculum_days))}")
    print(f"Difficulty at end: {state.difficulty.value}")
    print()
    print("--- Final Feedback ---")
    print(json.dumps(state.feedback.model_dump(mode="json"), indent=2))

    assert state.question_count >= settings.min_questions
    assert len(set(state.covered_curriculum_days)) >= settings.min_curriculum_days
    print("\nDemo satisfied MIN_QUESTIONS and MIN_CURRICULUM_DAYS requirements.")


if __name__ == "__main__":
    main()
