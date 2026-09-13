import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'pbvf-favorites';

/**
 * Favoris timetable persistés localement (AsyncStorage).
 */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setIds(JSON.parse(raw) as string[]);
      })
      .catch(() => undefined);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  return { ids, toggle, has: (id: string) => ids.includes(id) };
}
