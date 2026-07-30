# Studiq

An AI-powered college companion built around one clean daily agenda: schedule, classes, and an
AI study workspace, in place of paper planners and scattered productivity apps.

## Stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation)
- [Tamagui](https://tamagui.dev) for UI and theming (light/dark)
- [Zustand](https://zustand.docs.pmnd.rs) for state, persisted locally via [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- [Supabase](https://supabase.com) for cloud sync (optional — the app runs fully offline without it)
- [rrule](https://github.com/jkbrzt/rrule) for recurring schedule events, [date-fns](https://date-fns.org) for date handling

## Setup

```bash
npm install
npm run web    # or: npm run ios / npm run android
```

To enable Supabase cloud sync, copy `.env.example` to `.env` and fill in your project's URL and
anon key. Without it, all data stays local on-device (MMKV-backed, offline-first by default).

## Scripts

```bash
npm run web         # start web dev server
npm run ios         # start iOS dev server
npm run android     # start Android dev server
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

## Project status

This is **Phase 1** of the roadmap: foundation, planner, schedule, and classes.

Built and working end to end:

- Bottom navigation: Home, Schedule, Classes, Study, More
- Home: today's timeline (merging recurring + one-off events), upcoming assignments/exams, daily
  note, quick add
- Schedule: day/week/month views, recurring events via rrule, color-coded categories
- Classes: list + detail (professor, office hours, classroom, assignments, exams, announcements),
  linked into a Study workspace
- Study: Course → Unit → Lecture data model and navigation shell
- More: menu shell for GPA Tracker, Finance, Goals, Career Hub, College Match, Campus Resources,
  Settings
- Local persistence (MMKV) so data survives restarts; Supabase wired for optional cloud sync

Deliberately **not yet built** (see roadmap in the product spec):

- Lecture recording, transcription, and AI-generated study materials (Phase 2) — the Study tab's
  navigation and data model exist; "Record" and "Generate Unit Study Guide" are wired up but
  currently create placeholder records / show a "coming soon" notice rather than calling a real
  pipeline
- Syllabus import (PDF/image → auto-built class)
- GPA Tracker, Finance, Goals, Career Hub, College Match, Campus Resources (Phase 3) — placeholder
  screens only
- Drag-and-drop schedule editing, semester templates
- Cloud sync conflict resolution / multi-device sync (Supabase client is wired, sync logic is not)

No gamification (XP, levels, badges, streaks) by design — see the product spec.
