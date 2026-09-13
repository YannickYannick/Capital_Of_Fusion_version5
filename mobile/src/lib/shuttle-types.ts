/** Sens de la navette PBVF 2026. */
export type ShuttleDirection = 'to_hotel' | 'to_palmeraie';

export type ShuttleDay = {
  id: string;
  label: string;
  date: string;
  isoDate: string;
};

export type ShuttleDeparture = {
  id: number;
  dayId: string;
  direction: ShuttleDirection;
  time: string;
  sortOrder: number;
};

export type ShuttleDaySchedule = ShuttleDay & {
  toHotel: string[];
  toPalmeraie: string[];
};

export const SHUTTLE_DIRECTION_LABEL: Record<ShuttleDirection, string> = {
  to_hotel: 'Palmeraie → Hôtel',
  to_palmeraie: 'Hôtel → Palmeraie',
};
