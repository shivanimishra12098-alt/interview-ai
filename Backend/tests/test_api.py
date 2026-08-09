from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_start_interview_returns_expected_shape(candidate_strong):
    resp = client.post("/api/interview", json={"sessionId": "api-1", "candidate": candidate_strong})
    assert resp.status_code == 200
    body = resp.json()
    assert "reply" in body
    assert body.get("done", False) is False
    assert "feedback" not in body


def test_continue_interview_after_start(candidate_strong):
    client.post("/api/interview", json={"sessionId": "api-2", "candidate": candidate_strong})
    resp = client.post("/api/interview", json={"sessionId": "api-2", "message": "because trade-offs matter"})
    assert resp.status_code == 200
    body = resp.json()
    assert "reply" in body
    assert "done" in body


def test_starting_duplicate_session_returns_conflict(candidate_strong):
    client.post("/api/interview", json={"sessionId": "api-3", "candidate": candidate_strong})
    resp = client.post("/api/interview", json={"sessionId": "api-3", "candidate": candidate_strong})
    assert resp.status_code == 409


def test_message_for_unknown_session_returns_404():
    resp = client.post("/api/interview", json={"sessionId": "does-not-exist-xyz", "message": "hello"})
    assert resp.status_code == 404


def test_empty_message_returns_400(candidate_strong):
    client.post("/api/interview", json={"sessionId": "api-4", "candidate": candidate_strong})
    resp = client.post("/api/interview", json={"sessionId": "api-4", "message": "   "})
    assert resp.status_code == 400


def test_missing_session_id_returns_422_or_400(candidate_strong):
    resp = client.post("/api/interview", json={"candidate": candidate_strong})
    assert resp.status_code in (400, 422)


def test_malformed_candidate_returns_422(candidate_strong):
    resp = client.post("/api/interview", json={"sessionId": "api-5", "candidate": {"member": {"id": "X"}}})
    assert resp.status_code == 422


def test_full_interview_reaches_completion_via_api(candidate_strong):
    session_id = "api-full-1"
    resp = client.post("/api/interview", json={"sessionId": session_id, "candidate": candidate_strong})
    assert resp.status_code == 200
    done = resp.json().get("done", False)
    guard = 0
    while not done and guard < 30:
        resp = client.post(
            "/api/interview",
            json={"sessionId": session_id, "message": "because latency, cost, and trade-offs matter here"},
        )
        assert resp.status_code == 200
        body = resp.json()
        done = body.get("done", False)
        guard += 1
    assert done is True
    assert "feedback" in body
    assert set(body["feedback"].keys()) == {"summary", "strengths", "gaps", "next"}


def test_message_after_completion_returns_409(candidate_strong):
    session_id = "api-full-2"
    resp = client.post("/api/interview", json={"sessionId": session_id, "candidate": candidate_strong})
    done = resp.json().get("done", False)
    guard = 0
    while not done and guard < 30:
        resp = client.post(
            "/api/interview",
            json={"sessionId": session_id, "message": "because latency, cost, and trade-offs matter here"},
        )
        done = resp.json().get("done", False)
        guard += 1
    resp = client.post("/api/interview", json={"sessionId": session_id, "message": "one more?"})
    assert resp.status_code == 409
