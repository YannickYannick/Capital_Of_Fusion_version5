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

import { catalogs, localizeDayFields, translate, translateList, type TVars } from './translate';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type AppLocale,
  type Messages,
} from './types';

type LocaleContextValue = {
  locale: AppLocale;
  ready: boolean;
  messages: Messages;
  setLocale: (next: AppLocale) => void;
  t: (path: string, vars?: TVars) => string;
  tList: (path: string) => string[];
  dayLabel: (day: { id: string; label: string; date: string }) => {
    label: string;
    date: string;
  };
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is AppLocale {
  return value === 'en' || value === 'fr' || value === 'es';
}

/**
 * Provider i18n — défaut EN, persistance AsyncStorage.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (isLocale(stored)) setLocaleState(stored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const t = (path: string, vars?: TVars) => translate(locale, path, vars);
    const tList = (path: string) => translateList(locale, path);
    const dayLabel = (day: { id: string; label: string; date: string }) =>
      localizeDayFields(locale, day);
    return {
      locale,
      ready,
      messages: catalogs[locale],
      setLocale,
      t,
      tList,
      dayLabel,
    };
  }, [locale, ready, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * Hook i18n — t / tList / setLocale / flags dayLabel.
 */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
