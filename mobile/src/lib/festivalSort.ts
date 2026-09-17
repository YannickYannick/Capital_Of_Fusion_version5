/**
 * Tri planning festival — rien avant « Open Doors » en tête de liste.
 * Les créneaux qui commencent avant l’ouverture du jour = suite de la nuit (+24 h).
 */

export type SortableSlot = {
  day: string;
  start: string;
  artist?: string;
};

/** Repli si pas d’Open Doors ce jour-là (09:00). */
export const FESTIVAL_DAY_CUTOFF_FALLBACK_MINUTES = 9 * 60;

/**
 * Parse HH:mm → minutes depuis minuit.
 */
export function hmToMinutes(startHm: string): number {
  const [hRaw, mRaw] = startHm.split(':');
  const h = Number(hRaw) || 0;
  const m = Number(mRaw) || 0;
  return h * 60 + m;
}

/**
 * Heure d’Open Doors par jour (minutes).
 * Inputs: liste de créneaux.
 * Outputs: map dayId → minutes d’ouverture.
 */
export function buildOpenDoorMinutesByDay(
  slots: SortableSlot[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const slot of slots) {
    const name = (slot.artist || '').trim().toLowerCase();
    if (name !== 'open doors') continue;
    const mins = hmToMinutes(slot.start);
    const prev = map[slot.day];
    if (prev === undefined || mins < prev) {
      map[slot.day] = mins;
    }
  }
  return map;
}

/**
 * Minutes de tri « journée festival » (matin → soir → après Open Doors / nuit).
 * Inputs: start HH:mm, cutoff = Open Doors du jour (minutes).
 * Outputs: entier comparable pour sort.
 */
export function festivalSortMinutes(
  startHm: string,
  openDoorMinutes: number = FESTIVAL_DAY_CUTOFF_FALLBACK_MINUTES,
): number {
  const minutes = hmToMinutes(startHm);
  if (minutes < openDoorMinutes) {
    return minutes + 24 * 60;
  }
  return minutes;
}

/**
 * Comparateur de créneaux pour le planning.
 */
export function compareFestivalSlots(
  a: SortableSlot,
  b: SortableSlot,
  dayIndex: (dayId: string) => number,
  openDoorByDay: Record<string, number> = {},
): number {
  const di = dayIndex(a.day) - dayIndex(b.day);
  if (di !== 0) return di;
  const cutoffA = openDoorByDay[a.day] ?? FESTIVAL_DAY_CUTOFF_FALLBACK_MINUTES;
  const cutoffB = openDoorByDay[b.day] ?? FESTIVAL_DAY_CUTOFF_FALLBACK_MINUTES;
  return festivalSortMinutes(a.start, cutoffA) - festivalSortMinutes(b.start, cutoffB);
}
