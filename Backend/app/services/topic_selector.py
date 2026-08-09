"""Chooses which curriculum day/topic to interview on next.

Balances candidate weaknesses, strengths, experience, curriculum
relevance, and diversity -- and explicitly avoids simply walking
through the 31 days in order.
"""
from __future__ import annotations

import random

from app.schemas.interview import CandidateProfile, InterviewPlanItem, TopicSignal
from app.services.curriculum_service import CurriculumService


def build_interview_plan(
    profile: CandidateProfile,
    curriculum: CurriculumService,
    target_topics: int,
    rng: random.Random | None = None,
) -> list[InterviewPlanItem]:
    """Builds an ordered, prioritized (but not strictly sequential) plan.

    Priority: weak topics first (probe real gaps), then developing topics
    (probe depth on shaky passes), then a sample of strong/advanced topics
    (confirm mastery, go deeper). Skipped topics are never scheduled as if
    they were attempted -- but MAY be used to ask the candidate to reason
    about the topic cold, which the engine handles separately if needed.
    """
    rng = rng or random.Random()

    def _to_plan(signals: list[TopicSignal], reason: str) -> list[InterviewPlanItem]:
        items = []
        seen_days = set()
        for s in signals:
            if s.day in seen_days or not curriculum.is_valid_day(s.day):
                continue
            seen_days.add(s.day)
            items.append(InterviewPlanItem(curriculum_day=s.day, topic=s.title, reason=reason))
        return items

    weak = _to_plan(profile.weak_topics, "weakness signal: failed attempt")
    developing = _to_plan(profile.developing_topics, "developing signal: passed after many attempts")
    strong = _to_plan(profile.strong_topics, "strength signal: confirm mastery / probe depth")

    rng.shuffle(strong)  # don't always probe strengths in the same order

    plan: list[InterviewPlanItem] = []
    seen_days: set[int] = set()
    for bucket in (weak, developing, strong):
        for item in bucket:
            if item.curriculum_day in seen_days:
                continue
            plan.append(item)
            seen_days.add(item.curriculum_day)
            if len(plan) >= target_topics:
                return plan

    # Fall back to filling remaining slots with any valid curriculum day
    # not yet used, so the interview can still hit MIN_CURRICULUM_DAYS
    # even for a very thin candidate record.
    remaining_days = [d for d in curriculum.all_day_numbers() if d not in seen_days]
    rng.shuffle(remaining_days)
    for day in remaining_days:
        if len(plan) >= target_topics:
            break
        cd = curriculum.require_day(day)
        plan.append(InterviewPlanItem(curriculum_day=day, topic=cd.title, reason="fallback: ensure topic diversity"))

    return plan
