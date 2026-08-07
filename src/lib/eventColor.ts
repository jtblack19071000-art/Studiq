import { eventCategoryColors } from '@/src/types';
import type { ScheduleEvent, StudiqClass } from '@/src/types';

/**
 * Resolves the color a schedule event's calendar block should render in. A per-event override
 * wins if set; otherwise a class-linked event picks up that class's color (so all of a class's
 * lecture blocks match its color in the Classes list); otherwise falls back to the category color.
 */
export function resolveEventColor(event: ScheduleEvent, classesById: Map<string, StudiqClass>): string {
  if (event.color) return event.color;
  if (event.classId) {
    const studiqClass = classesById.get(event.classId);
    if (studiqClass) return studiqClass.color;
  }
  return eventCategoryColors[event.category];
}

/** Adds an alpha channel to a `#rrggbb` hex color, for translucent hero/background tints. */
export function withAlpha(hex: string, alpha: number): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return hex;
  const r = parseInt(match[1].slice(0, 2), 16);
  const g = parseInt(match[1].slice(2, 4), 16);
  const b = parseInt(match[1].slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * A class's auto-created meeting event used to be titled "<Class name> — Lecture" — dropped since
 * the block's color/position on the calendar already make clear it's a lecture, and the suffix
 * was crowding out the class name on narrow blocks. Events created before that change still carry
 * it in their stored title, so strip it at display time rather than requiring every existing
 * class to be re-saved just to pick up the shorter title.
 */
export function displayEventTitle(title: string): string {
  return title.replace(/ — Lecture$/, '');
}
