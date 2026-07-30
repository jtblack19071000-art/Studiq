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
- Supabase Auth for accounts (email/password), tied to [RevenueCat](https://www.revenuecat.com) (`react-native-purchases`) for the Platinum subscription

## Setup

```bash
npm install
npm run web    # or: npm run ios / npm run android
```

Copy `.env.example` to `.env` to configure:

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — optional cloud sync. Without
  these, all data stays local on-device (MMKV-backed, offline-first by default).
- `OPENAI_API_KEY` — required for lecture transcription. Server-only; never sent to the client.
- `ANTHROPIC_API_KEY` — required for AI-generated study materials (per-lecture, Unit Study Guide,
  and College Match guidance). Server-only; never sent to the client.
- `EXPO_PUBLIC_REVENUECAT_API_KEY` — required for the Platinum subscription to actually charge
  money. Safe to embed client-side (RevenueCat's SDK keys are public by design, unlike the two
  above). See "Subscriptions" below before this will do anything real.

Without the AI keys configured, recording still works fully (audio is captured and saved), but
transcription/generation fail with a clear in-app error rather than silently doing nothing. Without
Supabase configured, Platinum features show "sign in required, cloud sync isn't configured" instead
of a sign-in form. Without the RevenueCat key, Platinum shows as unavailable rather than crashing.

## Subscriptions

There is **no Silver tier** — just Free and Platinum ($3/month). Platinum gates: lecture
recording, transcription, per-lecture AI generation, Unit Study Guide generation + PDF export, and
the College Match AI best-fit guidance. Everything else (Home, Schedule, Classes, GPA Tracker,
Finance, Goals, Career Hub, Campus Resources) is free. Content already generated while subscribed
stays viewable if the subscription later lapses — only generating *new* content is gated.

Subscriptions require your own accounts; none of this can be set up or tested for real from a dev
sandbox:

1. An **App Store Connect** (iOS) and/or **Google Play Console** (Android) developer account, with
   an auto-renewable subscription product configured in each store.
2. A **RevenueCat** account (free to start) — connect your store(s), create an entitlement named
   exactly `platinum` (see `PLATINUM_ENTITLEMENT_ID` in `src/types/subscription.ts`), attach your
   store products to it as an offering/package, and copy the SDK key into
   `EXPO_PUBLIC_REVENUECAT_API_KEY`.
3. On **web**, RevenueCat's mobile SDK key won't work — web billing needs a separate "Web Billing"
   product/key from RevenueCat's dashboard, or you may prefer to skip web purchases entirely and
   direct web users to the mobile app to subscribe. Right now, using a non-web-billing key on web
   fails to configure (shown as a small non-fatal warning) and the app correctly falls back to
   showing everyone as Free rather than crashing — real web purchasing needs that separate setup.
4. Supabase Auth is what identifies the user RevenueCat ties the subscription to
   (`Purchases.logIn(userId)` on sign-in) — the Supabase env vars above must be set too.

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
transcription, AI-generated study materials), **Phase 3** (GPA Tracker, Finance, Goals, Career Hub,
College Match, Campus Resources), and a **Platinum subscription** (Supabase Auth + RevenueCat)
gating the AI-powered features are built.

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
  - **College Match** *(Platinum)* — a preferences profile (major, location, size, budget notes)
    plus a saved-schools application tracker, and an AI "best-fit guidance" quiz. There's no
    external college database to actually match against, so the AI reasons honestly over the
    student's own stated preferences (what to look for, questions to ask) rather than faking a
    "match score" against schools it has no real data on
  - **Campus Resources** — a personal directory (name, category, contact, location) the student
    fills in with their own campus's offices, since no per-school resource data source exists
  - **Settings** — cloud sync + account status, subscription status, appearance, about
- Local persistence (MMKV) so data survives restarts; Supabase wired for optional cloud sync
- **Platinum subscription** ($3/month, no Silver tier) gating lecture recording, transcription, all
  AI generation, and College Match — see "Subscriptions" above for what's required to charge real
  money; without those accounts configured, Platinum features show a clear "not configured" state
  rather than a broken or fake-unlocked one

Deliberately **not yet built** (see roadmap in the product spec):

- Syllabus import (PDF/image → auto-built class)
- Drag-and-drop schedule editing, semester templates
- Cloud sync conflict resolution / multi-device sync (Supabase client + auth are wired, but no
  screen actually reads/writes app data to Supabase yet — only auth uses it so far)

No gamification (XP, levels, badges, streaks) by design — see the product spec.

### Other known gaps

Beyond the roadmap items above:

- **Push notifications aren't wired up.** The `Reminder` type exists on schedule events, but
  nothing actually schedules a native notification for one yet.
- **Only auth talks to Supabase.** No screen syncs its actual data (classes, schedule, study
  materials, etc.) to the cloud yet — everything except the signed-in session is local-only.
- **Default Expo app icon/splash** — no custom Studiq branding yet.
- **No automated tests.** Nothing is written for Jest/Detox/Playwright yet.
- **Only tested in a web browser (Chromium)** — never run on a real iOS/Android device or
  simulator. The audio recording, permissions, and native subscription flows in particular should
  be smoke-tested on a real device before shipping; this session could only validate them through
  Chromium's fake-microphone flag and RevenueCat's browser-simulation fallback.

### Verification notes (Subscriptions & auth)

- Every "not configured" state (no Supabase, no RevenueCat key) was verified in-browser: Platinum
  gates correctly show a plain explanatory message instead of a broken UI, on every gated screen
  (Study recording, per-lecture generation, Unit Study Guide generation, College Match).
- Found and fixed two real bugs during verification, not just the "happy path":
  1. Supabase's auth client reads its storage adapter eagerly in its constructor (unlike zustand's
     persist middleware, which defers this) — during static-rendering (SSG), MMKV's web shim has
     no `localStorage` to back onto and threw, crashing the whole app the moment real-looking
     Supabase credentials were set. Fixed by making the storage adapters degrade to a no-op on
     failure (`src/lib/mmkvStorage.ts`) — there's no real session to load during prerendering
     anyway.
  2. `Purchases.configure()` throws synchronously on web if the key isn't a valid RevenueCat "Web
     Billing" key (a different format from the mobile SDK key) — this was an unhandled rejection
     that also crashed the app. Fixed by catching it and falling back to the free tier
     (`src/lib/purchases.ts`), surfaced as a small warning, not a crash.
- Verified with dummy-but-well-formed credentials (not real accounts) that: the sign-in/sign-up
  form renders and is interactive, RevenueCat correctly detects "Web platform... Browser Mode" and
  falls back gracefully, and the whole app continues working normally around a misconfigured or
  unreachable subscription backend. The actual sign-up round trip against a real Supabase project
  and a real RevenueCat purchase could not be tested without real accounts — see "Subscriptions"
  above for what to set up before relying on this in production.

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
