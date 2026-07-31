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
