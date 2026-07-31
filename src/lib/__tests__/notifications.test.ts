/// <reference types="jest" />

import * as Notifications from 'expo-notifications';

import {
  isNotificationPermissionGranted,
  notificationsSchedulingSupported,
  planScheduledReminders,
  requestNotificationPermissions,
  syncScheduledReminders,
} from '@/src/lib/notifications';
import type { ScheduleEvent } from '@/src/types';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const now = new Date('2024-01-01T00:00:00.000Z');

const baseEvent: ScheduleEvent = {
  id: 'e1',
  title: 'Organic Chemistry Lecture',
  category: 'class',
  location: 'Chem 118',
  startsAt: '2024-01-01T09:00:00.000Z', // a Monday
  endsAt: '2024-01-01T09:50:00.000Z',
  recurrence: { frequency: 'WEEKLY', byWeekday: [0] }, // every Monday
  reminders: [{ id: 'r1', minutesBefore: 10 }],
};

// planScheduledReminders is pure (no Platform/expo-notifications dependency), so it's tested
// directly rather than through syncScheduledReminders's platform/permission-gated orchestration.
describe('planScheduledReminders', () => {
  it('skips events with no reminders', () => {
    expect(planScheduledReminders([{ ...baseEvent, reminders: [] }], now)).toEqual([]);
  });

  it('plans one reminder per occurrence within the default 14-day window, with the right trigger time and body', () => {
    const plan = planScheduledReminders([baseEvent], now);

    // Two Mondays fall within [now, now+14d): Jan 1 and Jan 8. Jan 15 is outside the window.
    expect(plan).toEqual([
      {
        title: 'Organic Chemistry Lecture',
        body: 'Starts in 10 minutes · Chem 118',
        triggerDate: new Date('2024-01-01T08:50:00.000Z'),
      },
      {
        title: 'Organic Chemistry Lecture',
        body: 'Starts in 10 minutes · Chem 118',
        triggerDate: new Date('2024-01-08T08:50:00.000Z'),
      },
    ]);
  });

  it('skips a reminder whose trigger time has already passed for a given occurrence', () => {
    // 1200 minutes (20h) before Jan 1 09:00 is Dec 31 13:00 — already past `now` (Jan 1 00:00) —
    // but 20h before Jan 8 09:00 (Jan 7 13:00) is still in the future.
    const event: ScheduleEvent = { ...baseEvent, reminders: [{ id: 'r1', minutesBefore: 1200 }] };

    const plan = planScheduledReminders([event], now);

    expect(plan).toHaveLength(1);
    expect(plan[0]).toEqual({
      title: 'Organic Chemistry Lecture',
      body: 'Starts in 20 hours · Chem 118',
      triggerDate: new Date('2024-01-07T13:00:00.000Z'),
    });
  });

  it('plans one reminder per reminder when an event has multiple reminders', () => {
    const event: ScheduleEvent = {
      ...baseEvent,
      recurrence: undefined,
      reminders: [
        { id: 'r1', minutesBefore: 10 },
        { id: 'r2', minutesBefore: 60 },
      ],
    };

    const plan = planScheduledReminders([event], now);

    expect(plan).toHaveLength(2);
    expect(plan.map((p) => p.body)).toEqual([
      'Starts in 10 minutes · Chem 118',
      'Starts in 1 hour · Chem 118',
    ]);
  });

  it('formats a plural hour count and omits the location when the event has none', () => {
    const event: ScheduleEvent = {
      ...baseEvent,
      location: undefined,
      recurrence: undefined,
      reminders: [{ id: 'r1', minutesBefore: 120 }],
    };

    const plan = planScheduledReminders([event], now);

    expect(plan[0].body).toBe('Starts in 2 hours');
  });

  it('respects a custom window size, excluding occurrences beyond it', () => {
    const plan = planScheduledReminders([baseEvent], now, 3);
    // Only Jan 1 falls within a 3-day window; Jan 8 does not.
    expect(plan).toHaveLength(1);
    expect(plan[0].triggerDate).toEqual(new Date('2024-01-01T08:50:00.000Z'));
  });

  it('plans reminders across multiple events independently', () => {
    const secondEvent: ScheduleEvent = {
      ...baseEvent,
      id: 'e2',
      title: 'Library Shift',
      location: 'Main Library',
      startsAt: '2024-01-03T14:00:00.000Z',
      endsAt: '2024-01-03T17:00:00.000Z',
      recurrence: undefined,
      reminders: [{ id: 'r2', minutesBefore: 15 }],
    };

    const plan = planScheduledReminders([baseEvent, secondEvent], now, 3);

    expect(plan.map((p) => p.title)).toEqual(['Organic Chemistry Lecture', 'Library Shift']);
  });
});

// Platform.OS is 'web' by default in this Jest environment.
describe('notifications.ts on web (Platform.OS === "web")', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('notificationsSchedulingSupported is false', () => {
    expect(notificationsSchedulingSupported).toBe(false);
  });

  it('isNotificationPermissionGranted still delegates to expo-notifications (permissions work on web)', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    await expect(isNotificationPermissionGranted()).resolves.toBe(true);
  });

  it('requestNotificationPermissions still delegates to expo-notifications', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    await expect(requestNotificationPermissions()).resolves.toBe(false);
  });

  it('syncScheduledReminders no-ops without touching the scheduling APIs', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    const event: ScheduleEvent = {
      id: 'e1',
      title: 'Lecture',
      category: 'class',
      startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      reminders: [{ id: 'r1', minutesBefore: 10 }],
    };

    await syncScheduledReminders([event]);

    expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
