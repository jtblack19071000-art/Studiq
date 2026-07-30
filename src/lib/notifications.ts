import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getOccurrencesInRange } from '@/src/lib/occurrences';
import type { ScheduleEvent } from '@/src/types';

/**
 * expo-notifications has no scheduling backend on web (`scheduleNotificationAsync` throws
 * `UnavailabilityError` there) — reminders are local device notifications, native-only.
 * Permission requests do work on web (backed by the browser's own Notification API), so that
 * part of the flow is still testable there.
 */
export const notificationsSchedulingSupported = Platform.OS !== 'web';

/**
 * How far ahead to schedule. iOS caps pending local notifications at 64, so this can't cover a
 * full semester of recurring events — call `syncScheduledReminders` again (e.g. on app foreground
 * or whenever the schedule changes) to roll the window forward.
 */
const SYNC_WINDOW_DAYS = 14;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function isNotificationPermissionGranted(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

function reminderBody(minutesBefore: number, location: string | undefined): string {
  const timing =
    minutesBefore >= 60
      ? `${Math.round(minutesBefore / 60)} hour${minutesBefore >= 120 ? 's' : ''}`
      : `${minutesBefore} minute${minutesBefore === 1 ? '' : 's'}`;
  return `Starts in ${timing}${location ? ` · ${location}` : ''}`;
}

/**
 * Re-schedules every upcoming reminder from scratch. Simpler and more robust than tracking which
 * individual notifications are stale after an edit — this app doesn't schedule notifications for
 * anything else, so wiping and rebuilding is safe.
 */
export async function syncScheduledReminders(events: ScheduleEvent[]): Promise<void> {
  if (!notificationsSchedulingSupported) return;
  if (!(await isNotificationPermissionGranted())) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const rangeEnd = new Date(now.getTime() + SYNC_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  for (const event of events) {
    if (event.reminders.length === 0) continue;

    const occurrences = getOccurrencesInRange(event, now, rangeEnd);
    for (const occurrence of occurrences) {
      for (const reminder of event.reminders) {
        const triggerDate = new Date(occurrence.startsAt.getTime() - reminder.minutesBefore * 60 * 1000);
        if (triggerDate <= now) continue;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: event.title,
            body: reminderBody(reminder.minutesBefore, event.location),
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
        });
      }
    }
  }
}
