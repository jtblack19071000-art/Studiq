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
- Supabase Auth for accounts (email/password), tied to [RevenueCat](https://www.revenuecat.com) (`react-native-purchases`) for the Premium subscription
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) for local scheduled reminders (no push server — see "Reminders" below)
- [Jest](https://jestjs.io) (via [`jest-expo`](https://github.com/expo/expo/tree/main/packages/jest-expo)) for unit tests — see "Testing" below
- [EAS Build](https://docs.expo.dev/build/introduction/) (`expo-dev-client`) for installable dev
  builds on a physical device — see "Running on a physical device" below
- [Vercel](https://vercel.com) for a free static web preview deploy — see "Deploying a free
  preview" below

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
- `EXPO_PUBLIC_REVENUECAT_API_KEY` — required for the Premium subscription to actually charge
  money. Safe to embed client-side (RevenueCat's SDK keys are public by design, unlike the two
  above). See "Subscriptions" below before this will do anything real.

Without the AI keys configured, recording still works fully (audio is captured and saved), but
transcription/generation fail with a clear in-app error rather than silently doing nothing. Without
the RevenueCat key, Premium shows as unavailable rather than crashing. Supabase specifically
controls whether the app requires an account at all — see "Accounts & per-user cloud sync" below.

## Deploying a free preview (web)

The cheapest way to get this in front of real people — no $99/year Apple fee, no $25 Google Play
fee, no app-store review — is a free static web deploy. Studiq already builds to a static site
(`web.output: "static"` in `app.json`), so any static host works. [Vercel](https://vercel.com)'s
free Hobby plan is the easiest: no credit card, and it deploys straight from the GitHub repo this
project is already pushed to.

1. Go to [vercel.com](https://vercel.com) and sign up free (GitHub sign-in is fastest).
2. **Add New… → Project**, then **Import** this repo (`jtblack19071000-art/Studiq`).
3. Vercel reads `vercel.json` (already in the repo) automatically — build command
   `npm run build:web`, output directory `dist`. No settings to fill in; just click **Deploy**.
4. A couple minutes later you get a public `https://<something>.vercel.app` URL — share it with
   anyone, no install needed, works on phone or desktop browsers. Every future push to `main`
   redeploys it automatically.

**What won't work in this mode**: the four AI API routes (transcription, per-lecture generation,
Unit Study Guide generation, College Match guidance) are server code, and a static export
deliberately excludes them (`web.output` would need to be `"server"`, which needs an actual Node
host, not just static file hosting). They fail with a clear in-app error rather than crashing —
same honest-degradation behavior as running locally without the `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`
env vars set. Everything else — Schedule, the week grid calendar, Classes, GPA Tracker, Finance,
Goals, Career Hub, Campus Resources, lecture recording (capture only, not transcription),
Settings — works exactly as it does locally. If you later want the AI routes live too, that's a
bigger step (Vercel does support Expo Router's Node/server output via its serverless functions,
but it's more setup and means paying for OpenAI/Anthropic API usage on a publicly-reachable URL —
worth doing deliberately, not as a default).

`vercel.json`'s `rewrites` entry sends any URL Vercel doesn't find a static file for (e.g. a
dynamic route like `/study/<some-real-id>`) to `index.html`, where Expo Router's client-side
routing takes over — the standard pattern for deploying a client-rendered Expo Router app to a
static host. Routes that do have a matching static file (e.g. `/schedule`) are served directly by
Vercel's default clean-URL resolution, no rewrite needed.

## Running on a physical device (EAS Build)

**Expo Go alone isn't enough** — `react-native-purchases` (RevenueCat) is a native module Expo Go
doesn't bundle, so testing the real app (subscriptions included) on a phone needs a custom
[development build](https://docs.expo.dev/develop/development-builds/introduction/) via
[EAS Build](https://docs.expo.dev/build/introduction/) instead. This is already configured in the
repo (`expo-dev-client` installed, `eas.json` build profiles, `ios.bundleIdentifier`/`android.package`
set to `com.studiq.app` as placeholders — change these before a real store submission).

**EAS Build's free tier needs no credit card** and covers casual testing — a handful of builds a
month at no cost, separate from (and unrelated to) the $99/year Apple Developer Program fee, which
you only need once you're ready to actually submit to the App Store, not for this step.

What's already done vs. what you need to do yourself:

- ✅ `expo-dev-client` installed, `eas.json` created with `development`/`preview`/`production`
  build profiles, bundle identifiers set.
- ⬜ Create a free account at [expo.dev](https://expo.dev) if you don't have one.
- ⬜ Run these yourself (this can't be done from an automated sandbox — EAS builds require an
  interactive login):

  ```bash
  npx eas login                                          # one-time, opens a browser to sign in
  npx eas build:configure                                # links this project to your Expo account
  npx eas build --profile development --platform ios     # or --platform android
  ```

  (`npm run eas:login` / `npm run eas:build:dev:ios` / `npm run eas:build:dev:android` do the same
  thing.) The build runs on Expo's servers (~15–20 min for iOS, less for Android) and finishes with
  a QR code / link — scan it or open it on your phone to install.
- ⬜ Once installed, run `npm run start:dev-client` (instead of `npm run ios`/`android`) to start
  the dev server — the installed build connects to it for the usual fast-refresh iteration, just
  like Expo Go, but with RevenueCat and every other native module actually present.
- ⬜ **iOS specifically** also needs your device registered with your Apple Developer account
  first — `eas build` walks you through this (or does it automatically) the first time, but it
  does require the $99/year Apple Developer Program membership for *iOS* device installs. Android
  has no equivalent fee for installing a development build on your own device.

Rebuild (repeat the `eas build` command) whenever a *native* dependency changes (a new
`expo install`-ed package, a new config plugin, an `app.json` permission string). Everyday
JS/TS/UI changes don't need a rebuild — just the dev server restart.

## Accounts & per-user cloud sync

Studiq's data (classes, schedule, finance, study/lectures, goals, career, college-match, campus
resources, daily notes) is local-first by default (MMKV on-device), same as everything else
described in this README. Setting up Supabase turns that into **real per-account storage**: sign-in
becomes mandatory (a full-screen sign-in wall replaces the app until you sign in), and every one of
those 9 stores syncs to a Supabase table scoped to the signed-in user, so two different accounts on
the same device never see each other's data — one classmate's classes never leak into another's.

How it works, concretely:

- **Schema**: a single table, `public.user_store_state` (`user_id`, `store_name`, `data jsonb`,
  `updated_at`), with row-level security restricting every row to `auth.uid() = user_id`. Run
  `supabase/migrations/0001_user_store_state.sql` against your Supabase project (SQL editor or the
  Supabase CLI) — this repo doesn't run migrations for you automatically.
- **Sync logic** lives in `src/lib/cloudSync.ts`. Each store registers itself (name, a `serialize`
  function extracting its plain-data fields, and a `blank` shape) at module load. On sign-in,
  `startCloudSyncForUser` resets every registered store to `blank`, then applies whatever that
  account has saved in `user_store_state` (nothing, for a brand-new account) — local mutations
  after that push back to Supabase, debounced ~800ms. On sign-out, everything resets to blank again.
- **No local data carries over into a freshly signed-in account, ever** — this is deliberate, not a
  limitation to fix. Whatever you had locally before signing in (as an anonymous/offline user, or
  left over from a previous account on a shared device) is intentionally not merged into the
  account you're signing into, so there's no path for one account's data to leak into another's.
- **Without Supabase configured**, none of the above applies — no sign-in wall, no per-account
  isolation, just local on-device storage like before. This matches every other cloud-optional
  feature in this README (AI keys, RevenueCat): the app degrades gracefully rather than requiring
  infrastructure you haven't set up yet.
- **Known gap**: sync is best-effort, not a robust offline queue — a failed push (e.g. you went
  offline mid-edit) logs a warning and is not automatically retried until the next local mutation
  re-triggers the debounce. Fine for a first pass; worth hardening (retry-with-backoff, an offline
  mutation queue) before depending on it for anything you can't afford to lose.
- **Tension worth knowing about**: College Match is intentionally free and doesn't require Premium
  (see "Subscriptions" below — it's meant to be a low-friction hook for prospective/high-school
  students). But the sign-in wall above is app-wide when Supabase is configured, so a prospective
  student would still have to create an account just to reach College Match. If that friction turns
  out to matter, the fix is a specific pre-auth-accessible route for it rather than reworking the
  general gate — flagging this now rather than silently picking one behavior.

## Subscriptions

There is **no Silver tier** — just Free and Premium ($5.99/month or $49.99/year). The split is
deliberate: **free = everything organizational** (this is what gets a student to open Studiq every
day and recommend it to a friend), **Premium = everything AI** (this is where the OpenAI/Anthropic
API costs actually are). Concretely, Premium gates: lecture recording, transcription, per-lecture
AI generation (notes/flashcards/quizzes/mnemonics/etc), Unit Study Guide generation + PDF export —
all under the Study tab. **College Match is free**, even though it's AI-powered — it's meant to
hook prospective/high-school students before they'd ever consider paying, so it stays free. Home,
Schedule, Classes, GPA Tracker, Finance, Goals, Career Hub, and Campus Resources are all free with
no limits (no "first 3 classes free" traps). Content already generated while subscribed stays
viewable if the subscription later lapses — only generating *new* content is gated.

Subscriptions require your own accounts; none of this can be set up or tested for real from a dev
sandbox:

1. An **App Store Connect** (iOS) and/or **Google Play Console** (Android) developer account, with
   an auto-renewable subscription product configured in each store — set up both a monthly and an
   annual product to match the two prices above.
2. A **RevenueCat** account (free to start) — connect your store(s), create an entitlement named
   exactly `premium` (see `PREMIUM_ENTITLEMENT_ID` in `src/types/subscription.ts`), attach your
   monthly and annual store products to it as an offering with two packages, and copy the SDK key
   into `EXPO_PUBLIC_REVENUECAT_API_KEY`. The app reads the offering's `.monthly`/`.annual`
   convenience packages directly (`fetchPremiumOffer` in `src/lib/purchases.ts`), so no extra
   config is needed beyond naming them normally in RevenueCat.
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

## Testing

```bash
npm test            # jest
```

[Jest](https://jestjs.io) via [`jest-expo`](https://github.com/expo/expo/tree/main/packages/jest-expo)'s
`node` preset (no React Native rendering — logic and state tests only; see "Other known gaps" below
for what that excludes). 125 tests across 22 suites, covering every `src/lib/` module and every
Zustand store in `src/state/`:

**Calculation logic**

- `src/lib/occurrences.ts` — non-recurring events in/out of range and on the range boundary, weekly
  recurrence expansion, duration preservation across generated occurrences, multi-week intervals,
  and the `until` cutoff.
- `src/lib/gpa.ts` — `calculateGpa`'s credit-hour weighting (checked against a hand-computed
  expected value, not just eyeballed), classes missing a grade or credit hours correctly excluded
  from the average, an empty class list, and `groupClassesByTerm`.
- `src/lib/finance.ts` — `calculateMonthlySummary`'s income/expense/balance totals, transactions
  outside the reference month excluded, income-only/expense-only months (including a negative
  balance), and an empty list. This calculation used to live inline in the Finance screen's
  `useMemo`; it was pulled out into `src/lib/finance.ts` (verified behavior-unchanged in-browser
  afterward) so it could be tested like the other calculation modules.
- `src/lib/notifications.ts` — `planScheduledReminders` (the pure "what to schedule and when" half
  of the reminder sync, split out from the `expo-notifications`-calling half so the scheduling
  algorithm itself doesn't need a native environment to test): the 14-day window, skipping reminders
  whose trigger time has already passed, multiple reminders per event, multiple events, a custom
  window size, and the reminder body's singular/plural time and optional-location formatting. Plus
  `syncScheduledReminders`'s and the permission helpers' behavior under the natural test-environment
  Platform.OS ("web": scheduling APIs are never touched, matching the real web no-scheduling
  limitation described in "Reminders" above).
- `src/lib/studyGuidePdf.ts` — `escapeHtml` (the AI-generated-content escaping that keeps a lecture
  transcript's stray `<`/`&` from breaking the exported PDF's HTML) and `buildStudyGuideHtml`'s
  per-section rendering and omission-when-empty, both exported from the module specifically for this.
- `src/lib/eventColor.ts` — `resolveEventColor`'s precedence (per-event override beats a linked
  class's color beats the category default) and its fallback when `classId` points at a class that
  no longer exists.
- `src/lib/weekGridLayout.ts` — `layoutDayOccurrences`'s greedy overlap-column packing behind the
  week grid calendar: non-overlapping events each get their own column, overlapping events split
  into side-by-side columns sized to the cluster's peak concurrency, a freed-up column gets reused
  once its previous occupant ends, and an unrelated later event isn't squeezed by an earlier
  overlap it has nothing to do with.

**Client-side error handling** (mocked `fetch`)

- `src/lib/studyAi.ts` and `src/lib/collegeMatchAi.ts` — success responses parsed correctly, a JSON
  `{error}` body surfaced verbatim, and a non-JSON error body falling back to a generic
  "Request failed with status N" message, for every API-route wrapper (transcription, per-lecture
  generation, Unit Study Guide generation, College Match guidance).
- `src/lib/audioUpload.ts` — the web (fetch-a-blob-URI) vs. native (`{uri, name, type}` descriptor)
  branches.

**Configuration/degradation branches**

- `src/lib/supabase.ts` — the client is `null` unless both Supabase env vars are set.
- `src/lib/purchases.ts` — `tierFromEntitlements` (pure), and every exported function's behavior
  when RevenueCat isn't configured (the state this sandbox is naturally in, with no
  `EXPO_PUBLIC_REVENUECAT_API_KEY` set) — degrading to the free tier instead of touching the SDK.
- `src/lib/mmkvStorage.ts` — both the sync (zustand) and async (Supabase auth) storage adapters
  degrade to `null`/no-op instead of throwing when the underlying MMKV call throws, the exact
  scenario that crashed the app during static rendering before this wrapper existed (see
  "Verification notes (Subscriptions & auth)" below).

**Zustand stores** (`src/state/__tests__/`, driven headless via each store's `getState()`/`setState()`
— no React needed)

- CRUD stores (`notesStore`, `campusResourcesStore`, `careerStore`, `collegeMatchStore`,
  `goalsStore`, `scheduleStore`, `classesStore`): seeding, id assignment on create, forced initial
  status on create where the store enforces one (e.g. a new job application always starts "saved"
  regardless of what's passed in), patch-merge on update touching only the targeted record, and
  remove.
- `studyStore` — course/unit/lecture creation defaults (a new unit's study guide always starts
  `not_generated`; a new lecture always starts `pending`/`not_generated`), patch-merging into a
  lecture or a unit's nested `studyGuide`, and the `courseByClassId` lookup.
- `authStore` and `subscriptionStore` — behavior when Supabase/RevenueCat aren't configured (the
  state this sandbox is naturally in): `init()` finishes without a session, `signUp`/`signIn`
  surface a clear "not configured" error, `purchase()` rejects instead of silently unlocking
  Premium, `refresh()`/`restore()` resolve to the free tier without touching the SDK.

## Scripts

```bash
npm run web         # start web dev server
npm run ios         # start iOS dev server
npm run android     # start Android dev server
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm test            # jest
```

## Project status

**Phase 1** (foundation, planner, schedule, classes), **Phase 2** (Study AI: lecture recording,
transcription, AI-generated study materials), **Phase 3** (GPA Tracker, Finance, Goals, Career Hub,
College Match, Campus Resources), and a **Premium subscription** (Supabase Auth + RevenueCat)
gating the Study tab's AI-powered features are built.

Built and working end to end:

- Bottom navigation: Home, Schedule, Study, More — Schedule and Classes share one tab (a
  Calendar/Classes toggle at the top), since they're two views onto the same underlying data
- Home: today's timeline (merging recurring + one-off events), upcoming assignments/exams, daily
  note, quick add
- Schedule (Calendar view): day/week/month, recurring events via rrule. Week is a real hourly grid
  (12 AM–11 PM day columns, like Google Calendar) rather than a list — colored, tap-to-open blocks
  positioned and sized by actual time, with overlapping events automatically laid out side by side
  instead of stacked. Tapping any event (grid block or list row) opens a detail sheet with the full
  time range, location, and — for events linked to a class — that class's professor, room, office
  location, and office hours. Each event's block color defaults to its linked class's color (or the
  category color if unlinked) but can be overridden per-event from Quick Add or the detail sheet's
  color picker.
- Schedule (Classes view): the class list + detail (professor, office hours, classroom,
  assignments, exams, announcements), linked into a Study workspace
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
  - **College Match** *(free)* — a preferences profile (major, location, size, budget notes) plus a
    saved-schools application tracker, and an AI "best-fit guidance" quiz. Kept free (despite being
    AI-powered) since it's aimed at prospective/high-school students who wouldn't have a reason to
    pay yet — it's a hook, not a cost center. There's no external college database to actually
    match against, so the AI reasons honestly over the student's own stated preferences (what to
    look for, questions to ask) rather than faking a "match score" against schools it has no real
    data on
  - **Campus Resources** — a personal directory (name, category, contact, location) the student
    fills in with their own campus's offices, since no per-school resource data source exists
  - **Settings** — cloud sync + account status, subscription status, appearance, about
- Local persistence (MMKV) so data survives restarts; when Supabase is configured, a mandatory
  sign-in wall plus per-account cloud sync across all 9 data stores replaces that with real
  per-user storage — see "Accounts & per-user cloud sync" above
- **Premium subscription** ($5.99/month or $49.99/year, no Silver tier) gating lecture recording,
  transcription, and all per-lecture/Unit-Study-Guide AI generation — see "Subscriptions" above for
  what's required to charge real money; without those accounts configured, Premium features show a
  clear "not configured" state rather than a broken or fake-unlocked one
- **Reminders** — locally-scheduled device notifications for schedule events (see "Reminders"
  above); free for all users, no Premium gate

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
- **No screen/component or API-route test coverage.** "Testing" above covers every `src/lib/`
  module and every Zustand store, but nothing renders a screen — that would need `jest-expo`'s React
  Native preset plus mocking Tamagui's provider and `expo-router`'s navigation context, which hasn't
  been set up. The four `+api.ts` server routes (transcription, per-lecture generation, Unit Study
  Guide generation, College Match guidance) are also untested directly — their client-side callers
  in `src/lib/studyAi.ts`/`collegeMatchAi.ts` are covered, but not the route handlers' own
  request-parsing or their calls into the `ai` SDK. There's no Detox/Playwright e2e coverage either.
  Everything currently tested was verified with `jest-expo`'s lightweight `node` preset (no RN
  rendering environment), which is why it stops at "logic and state," not "UI."
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

- Every "not configured" state (no Supabase, no RevenueCat key) was verified in-browser: Premium
  gates correctly show a plain explanatory message instead of a broken UI, on every gated screen
  (Study recording, per-lecture generation, Unit Study Guide generation).
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
