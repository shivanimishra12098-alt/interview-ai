import json
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
PROFILE_PATH = DATA_DIR / "profile.json"

DEFAULT_PROFILE = {
    "fullName": "John Doe",
    "initials": "JD",
    "role": "AI Engineering Candidate",
    "cohort": "31-Day AI Engineering Cohort",
    "status": "Active",
    "day": 18,
    "totalDays": 31,
    "streak": 7,
    "daysCompleted": 18,
    "interviewsCompleted": 12,
    "averageScore": 84,
    "projectsCompleted": 4,
    "skills": [
        {"name": "Python", "pct": 82},
        {"name": "Prompt Engineering", "pct": 91},
        {"name": "RAG", "pct": 76},
        {"name": "Vector Databases", "pct": 68},
        {"name": "AI Agents", "pct": 73},
        {"name": "MCP", "pct": 42},
        {"name": "AI Deployment", "pct": 35},
        {"name": "System Design", "pct": 81},
    ],
    "interviewScores": [72, 76, 79, 81, 85, 84],
    "strengths": [
        "Strong problem-solving ability",
        "Clear technical communication",
        "Good understanding of RAG",
        "Strong Python fundamentals",
        "Consistent interview performance",
    ],
    "improvements": ["MCP fundamentals", "AI deployment", "Distributed systems", "Advanced agent architectures"],
    "achievements": [
        {"id": "a1", "title": "First Interview", "icon": "🏆", "desc": "Completed your first AI interview", "locked": False},
        {"id": "a2", "title": "7-Day Streak", "icon": "🔥", "desc": "Learned for 7 consecutive days", "locked": False},
        {"id": "a3", "title": "RAG Master", "icon": "🧠", "desc": "Scored 85%+ on RAG assessment", "locked": False},
        {"id": "a4", "title": "Fast Learner", "icon": "⚡", "desc": "Completed 7 days ahead of schedule", "locked": False},
        {"id": "a5", "title": "Interview Ready", "icon": "🎯", "desc": "Completed 10 interviews", "locked": False},
        {"id": "a6", "title": "AI Builder", "icon": "🔬", "desc": "Completed 3 AI projects", "locked": False},
    ],
    "recentActivity": [
        {"when": "Today", "items": ["Completed Day 18", "Scored 88% in AI Agent Interview"]},
        {"when": "Yesterday", "items": ["Completed Day 17", "Completed Agent Memory lesson"]},
        {"when": "2 days ago", "items": ["Completed Day 16", "Scored 82% in Tool Calling Interview"]},
        {"when": "3 days ago", "items": ["Completed mini project"]},
    ],
}


def load_profile():
    if PROFILE_PATH.exists():
        try:
            return json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
        except Exception:
            return DEFAULT_PROFILE.copy()
    return DEFAULT_PROFILE.copy()


def save_profile(profile):
    PROFILE_PATH.write_text(json.dumps(profile, indent=2), encoding="utf-8")
    return profile


def tokenize(text):
    return re.findall(r"[a-z0-9]+", text.lower())


def evaluate_answer(question, answer):
    if not question:
        return {
            "score": 0,
            "correctness": "irrelevant",
            "feedback": "The question was empty.",
            "strengths": [],
            "missingConcepts": [],
            "nextAction": "retry",
        }

    if not answer or not str(answer).strip():
        return {
            "score": 0,
            "correctness": "irrelevant",
            "feedback": "That response doesn't address the question. Please try again.",
            "strengths": [],
            "missingConcepts": ["Relevant explanation"],
            "nextAction": "retry",
        }

    lowered_question = question.lower()
    lowered_answer = str(answer).lower()
    tokens = set(tokenize(question))
    answer_tokens = set(tokenize(answer))

    concept_rules = [
        ("hash map", ["hash", "bucket", "collision", "chain", "probing", "open addressing"]),
        ("system design", ["scalability", "latency", "throughput", "cache", "sharding", "replication"]),
        ("database", ["schema", "index", "query", "join", "transaction"]),
        ("concurrency", ["thread", "lock", "race", "deadlock", "mutex", "atomic"]),
        ("algorithm", ["complexity", "binary search", "sorting", "graph", "dynamic programming"]),
        ("network", ["tcp", "http", "dns", "latency", "protocol"]),
        ("api", ["endpoint", "request", "response", "rest", "json"]),
    ]

    matched_concepts = []
    for _, concepts in concept_rules:
        if any(keyword in lowered_question for keyword in concepts):
            if any(keyword in lowered_answer for keyword in concepts):
                matched_concepts.append(concepts[0])

    overlap = len(tokens.intersection(answer_tokens))
    score = min(100, 35 + overlap * 8 + len(matched_concepts) * 10)
    if score >= 85:
        correctness = "excellent"
        feedback = "Excellent explanation. You covered the main concepts clearly."
        next_action = "next"
    elif score >= 70:
        correctness = "good"
        feedback = "Good answer. You addressed most of the important ideas."
        next_action = "next"
    elif score >= 45:
        correctness = "partial"
        feedback = "Partially correct. Add a little more detail on the core concepts and trade-offs."
        next_action = "followup"
    else:
        correctness = "incorrect"
        feedback = "That answer is incomplete. Try to explain the core idea with more concrete detail."
        next_action = "retry"

    missing_concepts = []
    for _, concepts in concept_rules:
        if any(keyword in lowered_question for keyword in concepts):
            if not any(keyword in lowered_answer for keyword in concepts):
                missing_concepts.append(concepts[0])

    return {
        "score": round(score),
        "correctness": correctness,
        "feedback": feedback,
        "strengths": matched_concepts[:3],
        "missingConcepts": missing_concepts[:3],
        "nextAction": next_action,
    }


class APIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, extra_headers=None):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.end_headers()

    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self._set_headers(status)
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json({"status": "ok"})
            return
        if parsed.path == "/api/profile":
            self._send_json(load_profile())
            return
        self._send_json({"error": "Not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        print("POST", parsed.path, flush=True)
        if parsed.path == "/api/evaluate":
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8") if length else "{}"
            try:
                payload = json.loads(body)
            except json.JSONDecodeError:
                self._send_json({"error": "Invalid JSON"}, 400)
                return
            result = evaluate_answer(payload.get("question", ""), payload.get("answer", ""))
            self._send_json(result)
            return
        self._send_json({"error": "Not found"}, 404)

    def do_PUT(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/profile":
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8") if length else "{}"
            try:
                payload = json.loads(body)
            except json.JSONDecodeError:
                self._send_json({"error": "Invalid JSON"}, 400)
                return
            saved = save_profile(payload)
            self._send_json(saved)
            return
        self._send_json({"error": "Not found"}, 404)

    def log_message(self, format, *args):
        return


def main():
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer((host, port), APIHandler)
    print(f"Backend listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
