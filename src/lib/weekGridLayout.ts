import type { EventOccurrence } from '@/src/lib/occurrences';

export interface PositionedOccurrence {
  occurrence: EventOccurrence;
  /** 0-based column index within its overlap cluster. */
  column: number;
  /** Total columns in this occurrence's overlap cluster — width = 1 / columnCount. */
  columnCount: number;
}

/**
 * Assigns each same-day occurrence a column so overlapping events render side-by-side instead of
 * stacked on top of each other, the way most calendar week views lay out a busy day. Greedy
 * interval-column packing: sorted by start time, each occurrence reuses the first column whose
 * previous occupant has already ended, else opens a new column. Non-overlapping occurrences (a
 * new column run starts only after every active column has ended) form separate clusters, each
 * sized independently — a single event later in the day doesn't get squeezed by an earlier
 * unrelated overlap.
 */
export function layoutDayOccurrences(occurrences: EventOccurrence[]): PositionedOccurrence[] {
  const sorted = [...occurrences].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.endsAt.getTime() - b.endsAt.getTime(),
  );

  const results: PositionedOccurrence[] = [];
  let cluster: { occurrence: EventOccurrence; column: number }[] = [];
  let activeColumnEnds: number[] = [];

  function flushCluster() {
    if (cluster.length === 0) return;
    const columnCount = Math.max(...cluster.map((item) => item.column)) + 1;
    for (const item of cluster) {
      results.push({ occurrence: item.occurrence, column: item.column, columnCount });
    }
    cluster = [];
    activeColumnEnds = [];
  }

  for (const occurrence of sorted) {
    const startMs = occurrence.startsAt.getTime();
    if (cluster.length > 0 && startMs >= Math.max(...activeColumnEnds)) {
      flushCluster();
    }

    let column = activeColumnEnds.findIndex((end) => end <= startMs);
    if (column === -1) {
      column = activeColumnEnds.length;
      activeColumnEnds.push(occurrence.endsAt.getTime());
    } else {
      activeColumnEnds[column] = occurrence.endsAt.getTime();
    }

    cluster.push({ occurrence, column });
  }
  flushCluster();

  return results;
}
