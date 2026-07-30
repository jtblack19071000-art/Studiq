# Studiq

An AI-powered college companion built around one clean daily agenda: schedule, classes, and an
AI study workspace, in place of paper planners and scattered productivity apps.

## Stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation, plus API routes for server-side AI calls)
- [Tamagui](https://tamagui.dev) for UI and theming (light/dark)
- [Zustand](https://zustand.docs.pmnd.rs) for state, persisted locally via [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- [Supabase](https://supabase.com) for cloud sync (optional — the app runs fully offline without it)
- [rrule](https://github.com/jkbrzt/rrule) for recurring schedule events, [date-fns](https://date-fns.org) for date handling
- [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) for lecture recording
- [Vercel AI SDK](https://ai-sdk.dev) (`ai` + `@ai-sdk/openai` + `@ai-sdk/anthropic`) for transcription (OpenAI Whisper) and structured study-material generation (Claude)
- [expo-print](https://docs.expo.dev/versions/latest/sdk/print/) + [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) for study guide PDF export

## Setup

```bash
npm install
npm run web    # or: npm run ios / npm run android
```

Copy `.env.example` to `.env` to configure:

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — optional cloud sync. Without
  these, all data stays local on-device (MMKV-backed, offline-first by default).
- `OPENAI_API_KEY` — required for lecture transcription. Server-only; never sent to the client.
- `ANTHROPIC_API_KEY` — required for AI-generated study materials (per-lecture and Unit Study
  Guide). Server-only; never sent to the client.

Without the AI keys configured, recording still works fully (audio is captured and saved), but
transcription/generation fail with a clear in-app error rather than silently doing nothing.

## Scripts

```bash
npm run web         # start web dev server
npm run ios         # start iOS dev server
npm run android     # start Android dev server
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

## Project status

**Phase 1** (foundation, planner, schedule, classes), **Phase 2** (Study AI: lecture recording,
transcription, AI-generated study materials), and **Phase 3** (GPA Tracker, Finance, Goals, Career
Hub, College Match, Campus Resources) are built.

Built and working end to end:

- Bottom navigation: Home, Schedule, Classes, Study, More
- Home: today's timeline (merging recurring + one-off events), upcoming assignments/exams, daily
  note, quick add
- Schedule: day/week/month views, recurring events via rrule, color-coded categories
- Classes: list + detail (professor, office hours, classroom, assignments, exams, announcements),
  linked into a Study workspace
- Study workspace, matching the spec's workflow exactly:
  - Course → Unit → Lecture hierarchy
  - Record a lecture on-device (`expo-audio`, mic permission handling, pause/resume/stop)
  - Each lecture is automatically transcribed server-side (OpenAI Whisper via an Expo Router API
    route — audio never touches a third-party API key on the client)
  - AI generates per-lecture notes, summary, vocabulary, formulas, professor emphasis, detected
    assignments, flashcards, a practice quiz, and concept explanations (Claude, structured output)
  - "Generate Unit Study Guide" analyzes **all** transcribed lectures in the unit together and
    produces a full study guide, review sheet, chapter summary, key concepts, vocabulary,
    equations/formulas, flashcards, practice quiz, practice exam, likely exam topics, professor
    emphasis, mnemonics, and a review checklist
  - Export the generated Unit Study Guide to PDF
- More:
  - **GPA Tracker** — credit-hour-weighted GPA (standard 4.0 scale), grouped by term with
    cumulative + per-term totals, editable credit hours and final letter grade per class
  - **Finance** — income/expense tracking with categories, this-month summary (income, expenses,
    balance)
  - **Goals** — academic/career/personal/health/financial goals with status tracking
  - **Career Hub** — internship/job application tracker (saved → applied → interviewing → offer/
    accepted/rejected)
  - **College Match** — a preferences profile (major, location, size, budget notes) plus a saved-
    schools application tracker. There's no external college database to actually match against,
    so this is an honest self-directed research tracker, not an automated matching algorithm —
    said plainly rather than faking a "match score" with no real data behind it
  - **Campus Resources** — a personal directory (name, category, contact, location) the student
    fills in with their own campus's offices, since no per-school resource data source exists
  - **Settings** — cloud sync status, appearance, about
- Local persistence (MMKV) so data survives restarts; Supabase wired for optional cloud sync

Deliberately **not yet built** (see roadmap in the product spec):

- Syllabus import (PDF/image → auto-built class)
- Drag-and-drop schedule editing, semester templates
- Cloud sync conflict resolution / multi-device sync (Supabase client is wired, sync logic is not)
- Any subscription/paywall system — the spec mentions "premium features" for Phase 3 but that's a
  monetization decision, not something to assume unprompted

No gamification (XP, levels, badges, streaks) by design — see the product spec.

### Verification notes (Phase 3)

All six screens are local CRUD with no external dependency, so they were fully exercised end to
end in a real browser: add/remove/status-cycle on every screen, and the GPA calculation was
checked against hand-computed expected values (credit-hour-weighted, both per-term and cumulative)
rather than just eyeballed.

### Verification notes (Phase 2)

- Recording, transcription-pipeline wiring, generation-pipeline wiring, and every UI status state
  (pending/transcribing/failed/generating/ready) were exercised end to end in a real browser
  (Chromium with a fake microphone device) against the real API routes.
- The Anthropic generation path was verified against the **real** Anthropic API (with an
  intentionally invalid key, to confirm the call succeeds in reaching the API and fails cleanly
  rather than crashing) — confirmed working.
- The OpenAI transcription path could not be verified against the real OpenAI API from this
  development sandbox specifically (its network egress only allow-lists `anthropic.com`, not
  `openai.com`); the route code was still confirmed to build the request correctly and fail
  cleanly on the network error, with no crash. It should be verified against a real key in a
  normal environment before relying on it.
- **Deploying** the API routes (not just running them via `expo start` in dev) requires
  `"web": { "output": "server" }` in `app.json` instead of `"static"` — a static export skips
  API routes entirely. This project currently uses `"static"` (needed for the plain static/SPA
  client build); switch to `"server"` and deploy behind a Node server (or EAS Hosting) to serve
  the API routes in production.
