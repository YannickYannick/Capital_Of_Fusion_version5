/**
 * Tri planning festival — les créneaux après minuit restent en fin de soirée.
 */

/** Avant cette heure (HH), le créneau est traité comme suite de la nuit (+24 h). */
export const FESTIVAL_DAY_CUTOFF_HOUR = 9;

/**
 * Minutes depuis le début de « journée festival » (matin → soir → après-minuit).
 * Inputs: start HH:mm
 * Outputs: entier comparable pour sort
 */
export function festivalSortMinutes(startHm: string): number {
  const [hRaw, mRaw] = startHm.split(':');
  const h = Number(hRaw) || 0;
  const m = Number(mRaw) || 0;
  const minutes = h * 60 + m;
  if (h < FESTIVAL_DAY_CUTOFF_HOUR) {
    return minutes + 24 * 60;
  }
  return minutes;
}

/**
 * Comparateur de créneaux pour le planning (jour optionnel via daysOrder).
 */
export function compareFestivalSlots(
  a: { day: string; start: string },
  b: { day: string; start: string },
  dayIndex: (dayId: string) => number,
): number {
  const di = dayIndex(a.day) - dayIndex(b.day);
  if (di !== 0) return di;
  return festivalSortMinutes(a.start) - festivalSortMinutes(b.start);
}
