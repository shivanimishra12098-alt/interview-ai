# AI Interviewer — Frontend

An adaptive AI technical interview platform UI. React + Vite + TypeScript + Tailwind CSS + React Router, now wired to a lightweight Python backend for evaluation and profile persistence.

## Getting started

1. Start the backend:

```bash
PORT=8010 python Backend/server.py
```

2. In a second terminal, start the frontend:

```bash
cd Frontend
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build for production:

```bash
cd Frontend
npm run build
npm run preview
```

## What's inside

- `/` — Landing page
- `/dashboard` — Stats, recent interviews, recommended topics
- `/interview/new` — Configure a new interview (type, difficulty, topics, question count, mode)
- `/interview/:id` — Live chat interview with an adaptive mock AI engine
- `/interview/:id/result` — Feedback report with a downloadable `.txt` summary
- `/history` — Past interviews with search + filters
- `/resources` — Learning resources by category
- `/profile` — Skills, stats, achievements backed by the API
- `/settings` — Appearance, interview defaults, notifications (persisted to `localStorage`)

## Notes

- The frontend now calls `/api/evaluate` and `/api/profile`.
- The Python backend is intentionally lightweight and uses the standard library so you can run it without extra dependencies.
- If the backend is unavailable, the frontend falls back to local mock evaluation and local profile storage.
