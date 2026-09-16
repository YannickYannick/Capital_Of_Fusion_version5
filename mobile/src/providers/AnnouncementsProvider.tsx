import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';

import { useLocale } from '@/src/i18n/LocaleContext';
import {
  fetchFestivalAnnouncements,
  filterNormal,
  filterUrgent,
  localAnnouncementsFallback,
  type FestivalAnnouncement,
} from '@/src/lib/announcements';

const DISMISS_KEY = 'pbvf-dismissed-announcements';
/** Rafraîchit le bandeau sans relancer l’app. */
const POLL_MS = 20_000;

type AnnouncementsContextValue = {
  urgent: FestivalAnnouncement | null;
  urgentItems: FestivalAnnouncement[];
  normal: FestivalAnnouncement[];
  dismissUrgent: (id: string) => void;
  dismissAllUrgent: () => void;
  refresh: () => void;
};

const AnnouncementsContext = createContext<AnnouncementsContextValue | null>(null);

/**
 * Charge les annonces, rafraîchit en arrière-plan, gère le dismiss du bandeau.
 */
export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [items, setItems] = useState<FestivalAnnouncement[]>(() =>
    localAnnouncementsFallback(locale),
  );
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(DISMISS_KEY)
      .then((raw) => {
        if (!raw) return;
        const ids = JSON.parse(raw) as string[];
        if (Array.isArray(ids)) setDismissed(new Set(ids));
      })
      .catch(() => undefined);
  }, []);

  const refresh = useCallback(() => {
    fetchFestivalAnnouncements(locale)
      .then(setItems)
      .catch(() => undefined);
  }, [locale]);

  useEffect(() => {
    setItems(localAnnouncementsFallback(locale));
    refresh();
  }, [locale, refresh]);

  useEffect(() => {
    const timer = setInterval(refresh, POLL_MS);
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const onVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refresh();
      }
    };
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisible);
    }
    return () => {
      clearInterval(timer);
      appSub.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisible);
      }
    };
  }, [refresh]);

  const persistDismissed = useCallback((next: Set<string>) => {
    AsyncStorage.setItem(DISMISS_KEY, JSON.stringify([...next])).catch(() => undefined);
  }, []);

  const dismissUrgent = useCallback(
    (id: string) => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        persistDismissed(next);
        return next;
      });
    },
    [persistDismissed],
  );

  const dismissAllUrgent = useCallback(() => {
    setDismissed((prev) => {
      const next = new Set(prev);
      for (const a of filterUrgent(items)) next.add(String(a.id));
      persistDismissed(next);
      return next;
    });
  }, [items, persistDismissed]);

  const value = useMemo<AnnouncementsContextValue>(() => {
    const urgentItems = filterUrgent(items).filter((a) => !dismissed.has(String(a.id)));
    return {
      urgent: urgentItems[0] ?? null,
      urgentItems,
      normal: filterNormal(items),
      dismissUrgent,
      dismissAllUrgent,
      refresh,
    };
  }, [items, dismissed, dismissUrgent, dismissAllUrgent, refresh]);

  return (
    <AnnouncementsContext.Provider value={value}>{children}</AnnouncementsContext.Provider>
  );
}

export function useAnnouncements(): AnnouncementsContextValue {
  const ctx = useContext(AnnouncementsContext);
  if (!ctx) {
    return {
      urgent: null,
      urgentItems: [],
      normal: [],
      dismissUrgent: () => undefined,
      dismissAllUrgent: () => undefined,
      refresh: () => undefined,
    };
  }
  return ctx;
}
