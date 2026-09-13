import { useEffect, useState } from 'react';

import { fetchFestivalProgram } from '@/src/lib/api/program';
import type { FestivalDayApi, ProgramSlotApi } from '@/src/types/api';

/** Planning festival depuis API Django (Supabase) avec repli local. */
export function useProgram() {
  const [days, setDays] = useState<FestivalDayApi[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [slots, setSlots] = useState<ProgramSlotApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchFestivalProgram()
      .then((data) => {
        if (cancelled) return;
        setDays(data.days ?? []);
        setStages(data.stages ?? []);
        setSlots(data.slots ?? []);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Impossible de charger le planning');
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { days, stages, slots, loading, error };
}
