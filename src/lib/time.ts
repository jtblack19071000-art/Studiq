/** Parses "HH:mm" into a Date anchored to today; returns null on invalid input. */
export function parseTimeToday(time: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** Formats an ISO datetime string as "HH:mm" in local time, for prefilling time inputs. */
export function formatTimeOfDay(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
