/**
 * Parses a time typed as either 12-hour with AM/PM ("1:30 PM", "1:30pm", "1:30 P.M.") or bare
 * 24-hour ("13:30") into a Date anchored to today. No leading zero required either way. Returns
 * null on invalid input.
 */
export function parseTimeToday(time: string): Date | null {
  const trimmed = time.trim();

  const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*([AaPp])\.?[Mm]\.?$/.exec(trimmed);
  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    if (hours < 1 || hours > 12 || minutes > 59) return null;

    const isPm = twelveHourMatch[3].toLowerCase() === 'p';
    if (isPm && hours !== 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    if (hours > 23 || minutes > 59) return null;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  return null;
}

/** Formats an ISO datetime string as "1:30 PM" in local time, for prefilling time inputs. */
export function formatTimeOfDay(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
