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
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) for local scheduled reminders (no push server — see "Reminders" below)

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

## Reminders

Studiq has no push notification server — "push notifications" here means locally-scheduled device
notifications (`expo-notifications`), which work fully offline and need no backend at all. Set a
reminder (e.g. "10 min before") on any schedule event in Quick Add; Studiq schedules a real
notification for every upcoming occurrence, including recurring ones.

Two real platform limits worth knowing:

- **Native only.** `expo-notifications` has no scheduling backend on web — the browser can grant
  the *permission*, but nothing ever actually gets scheduled there. Settings correctly hides the
  "Enable notifications" control on web rather than showing a button that would silently do
  nothing.
- **A rolling 14-day window, not the full recurrence.** iOS caps an app at 64 pending local
  notifications, so scheduling every future occurrence of a weekly class for a whole semester
  isn't possible. Studiq re-schedules from scratch — 14 days out — every time the app launches or
  the schedule changes, which keeps reminders current without hitting that cap for a typical
  course load. If you leave the app closed for more than ~2 weeks, reopen it before the next
  reminder is due so the window rolls forward.

## Branding

Custom app icon, Android adaptive icon set, favicon, and splash screen (`assets/images/`),
replacing the default Expo placeholder assets:

- **Mark**: a bold, single-stroke "S" monogram — geometric and rounded rather than a literal
  letterform from a font, so it stays crisp and legible from a 48px favicon up to a 1024px app
  icon and holds up under Android's circular/squircle adaptive-icon masks.
- **Color**: a bright indigo-violet (`#5B4CF5`), used as the full-bleed icon/favicon background,
  the Android adaptive icon background, and the splash screen background — chosen to stand out
  among the blues most productivity/education apps default to, while still reading as focused and
  organized rather than loud.
- **Splash screen** pairs the same mark with a "Studiq" wordmark underneath, composited with
  `resizeMode: "contain"` onto the brand color.
- Generated as SVG/HTML rendered to PNG at each target's exact pixel size (no upscaling), rather
  than a single image resized down — every asset was verified against its actual constraints:
  `icon.png`/`favicon.png`/`android-icon-background.png` are opaque (no alpha channel, matching
  what iOS/store icons expect), `android-icon-foreground.png`/`android-icon-monochrome.png`/
  `splash-icon.png` are transparent, and the mark was checked centered well inside Android's
  adaptive-icon safe zone under a circular mask before finalizing.

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
- **Reminders** — locally-scheduled device notifications for schedule events (see "Reminders"
  above); free for all users, no Platinum gate

Deliberately **not yet built** (see roadmap in the product spec):

- Syllabus import (PDF/image → auto-built class)
- Drag-and-drop schedule editing, semester templates
- Cloud sync conflict resolution / multi-device sync (Supabase client + auth are wired, but no
  screen actually reads/writes app data to Supabase yet — only auth uses it so far)

No gamification (XP, levels, badges, streaks) by design — see the product spec.

### Other known gaps

Beyond the roadmap items above:

- **Only auth talks to Supabase.** No screen syncs its actual data (classes, schedule, study
  materials, etc.) to the cloud yet — everything except the signed-in session is local-only.
- **No automated tests.** Nothing is written for Jest/Detox/Playwright yet.
- **Only tested in a web browser (Chromium)** — never run on a real iOS/Android device or
  simulator. The audio recording, permissions, and native subscription flows in particular should
  be smoke-tested on a real device before shipping; this session could only validate them through
  Chromium's fake-microphone flag and RevenueCat's browser-simulation fallback.

### Verification notes (Reminders)

- Settings' permission flow was exercised in a real browser: on web, the "Enable notifications"
  button correctly never appears — `notificationsSchedulingSupported` is `false` there by design,
  since `expo-notifications` has no web scheduling implementation at all (only permissions do,
  backed by the browser's native `Notification` API). This is documented behavior, not a bug found
  during testing.
- Quick Add's reminder picker was exercised end to end: selecting "1 hour before" visibly updates
  the selected state, and the created event carries the reminder through to the store.
- Proactively re-checked for the same "eager native call crashes SSG" bug class that hit Supabase
  auth and RevenueCat, since `Notifications.setNotificationHandler(...)` also runs at module scope.
  Ran a full `expo export -p web` after wiring the feature — it completed cleanly with no crash.
- What couldn't be verified: actual notification delivery/firing. Scheduling is native-only
  (`notificationsSchedulingSupported` gates it off entirely on web), and this sandbox is web-only,
  so the `scheduleNotificationAsync` call path itself was verified by code review, not a live
  device run. It should be smoke-tested on a real iOS/Android device before shipping, alongside the
  other native-only flows already called out above (audio recording, RevenueCat purchases).

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
