"""Turns a raw candidate record into a normalized CandidateProfile.

Rules (per project spec):
  - Passed on first attempt        -> potential strength
  - Passed after many attempts     -> potential learning difficulty ("developing")
  - Failed                         -> weakness signal
  - Skipped                        -> unknown; never assumed mastery, never assumed weakness
  - Never invents candidate history that isn't in missions[].
"""
from __future__ import annotations

from app.schemas.candidate import Candidate
from app.schemas.interview import CandidateProfile, TopicSignal

# Attempts <= this are treated as "first try / easy pass" -> strength signal.
FIRST_TRY_THRESHOLD = 1
# Attempts >= this on a pass are treated as a learning-difficulty signal.
MANY_ATTEMPTS_THRESHOLD = 3


def _experience_level(years: int) -> str:
    if years <= 2:
        return "junior"
    if years <= 6:
        return "mid"
    if years <= 12:
        return "senior"
    return "staff+"


def build_candidate_profile(candidate: Candidate) -> CandidateProfile:
    strong: list[TopicSignal] = []
    developing: list[TopicSignal] = []
    weak: list[TopicSignal] = []
    skipped: list[TopicSignal] = []
    advanced: list[TopicSignal] = []

    experience_level = _experience_level(candidate.member.yearsExperience)

    for mission in candidate.missions:
        signal = TopicSignal(
            day=mission.day,
            title=mission.title,
            outcome=mission.outcome,
            attempts=mission.attempts,
        )
        if mission.outcome == "skipped":
            skipped.append(signal)
        elif mission.outcome == "failed":
            weak.append(signal)
        elif mission.outcome == "passed":
            attempts = mission.attempts or 1
            if attempts <= FIRST_TRY_THRESHOLD:
                strong.append(signal)
            elif attempts >= MANY_ATTEMPTS_THRESHOLD:
                developing.append(signal)
            else:
                # Passed with a moderate number of attempts: solid but not
                # exceptional -- treated as strong for interviewing purposes,
                # since it's a confirmed pass.
                strong.append(signal)
        # "unknown" outcome: no mission data recorded -> not included anywhere.

    # Advanced topics: later-module days (agentic AI, MCP, security,
    # deployment, capstone -- days 21+) that the candidate passed cleanly.
    advanced = [s for s in strong if s.day >= 21]

    # Recommended topics for the interview: prioritize weak topics (probe
    # gaps), then developing topics (probe depth), then a sample of strong
    # topics (confirm mastery / go deeper), while never recommending a
    # skipped topic as if it were attempted.
    recommended = (weak + developing + strong)[:10]

    return CandidateProfile(
        experience_level=experience_level,
        strong_topics=strong,
        developing_topics=developing,
        weak_topics=weak,
        skipped_topics=skipped,
        advanced_topics=advanced,
        recommended_topics=recommended,
    )
