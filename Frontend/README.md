# AI Interviewer — Frontend

An adaptive AI technical interview platform UI. React + Vite + TypeScript + Tailwind CSS + React Router. No backend required — everything runs on local mock data and `localStorage`.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build for production:

```bash
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
- `/profile` — Skills, stats, achievements
- `/settings` — Appearance, interview defaults, notifications (persisted to `localStorage`)

## Notes

- This was built and syntax-checked without network access to npm, so dependencies were never installed or build-tested in the authoring environment. Everything has been carefully hand-reviewed, but please run `npm install && npm run dev` and let me know if anything needs a fix — I'm happy to debug further.
- All data is mocked locally (`src/data/mockData.ts`) and interview results/settings persist via `localStorage`, so the app is fully demo-ready with zero backend.
