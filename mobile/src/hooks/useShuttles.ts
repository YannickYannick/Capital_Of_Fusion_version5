import { useEffect, useState } from 'react';

import { fetchShuttleSchedules } from '@/src/lib/api/shuttles';
import type { ShuttleDayScheduleApi } from '@/src/types/api';

/** Navettes depuis l'API Django → Supabase. */
export function useShuttles() {
  const [schedules, setSchedules] = useState<ShuttleDayScheduleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchShuttleSchedules()
      .then((data) => {
        if (!cancelled) setSchedules(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Impossible de charger les navettes');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { schedules, loading, error };
}
