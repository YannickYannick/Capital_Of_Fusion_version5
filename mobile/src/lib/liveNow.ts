/**
 * Helpers « live maintenant » — basés sur la date réelle, pas le flag seed `live`.
 */

export type TimedSlot = {
  id: string;
  day: string;
  start: string;
  end: string;
  artist: string;
  stage: string;
};

export type DayWithIso = {
  id: string;
  label: string;
  date: string;
  isoDate: string;
};

/**
 * Parse HH:mm → heures / minutes.
 */
function parseHm(value: string): { h: number; m: number } {
  const [h, m] = value.split(':').map((n) => Number(n) || 0);
  return { h, m };
}

/**
 * Construit Date locale pour un jour ISO + HH:mm.
 */
export function atIsoDay(isoDate: string, hm: string): Date {
  const { h, m } = parseHm(hm);
  const [y, mo, d] = isoDate.split('-').map(Number);
  return new Date(y, mo - 1, d, h, m, 0, 0);
}

/**
 * Fenêtre [start, end) d’un créneau (gère minuit).
 */
export function slotWindow(
  slot: Pick<TimedSlot, 'day' | 'start' | 'end'>,
  days: DayWithIso[],
): { start: Date; end: Date } | null {
  const day = days.find((d) => d.id === slot.day);
  if (!day?.isoDate) return null;
  const start = atIsoDay(day.isoDate, slot.start);
  let end = atIsoDay(day.isoDate, slot.end);
  if (end <= start) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }
  return { start, end };
}

/**
 * Créneau réellement en cours à `now` (ignore le flag seed `live`).
 */
export function findLiveSlot(
  slots: TimedSlot[],
  days: DayWithIso[],
  now = new Date(),
): TimedSlot | null {
  for (const slot of slots) {
    const w = slotWindow(slot, days);
    if (!w) continue;
    if (now >= w.start && now < w.end) return slot;
  }
  return null;
}

/**
 * Ouverture festival = premier jour (jeudi) à 18h00.
 */
export function festivalStartDate(days: DayWithIso[]): Date | null {
  const first = days[0];
  if (!first?.isoDate) return null;
  return atIsoDay(first.isoDate, '18:00');
}
