import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import type { AppLocale, Messages } from './types';

export const catalogs: Record<AppLocale, Messages> = { en, fr, es };

export type TVars = Record<string, string | number>;

/**
 * Lit une valeur imbriquée par chemin "a.b.c".
 */
export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Remplace {var} dans une chaîne.
 */
export function interpolate(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  );
}

/**
 * Traduit un chemin (fallback EN).
 */
export function translate(
  locale: AppLocale,
  path: string,
  vars?: TVars,
): string {
  const raw =
    getPath(catalogs[locale], path) ?? getPath(catalogs.en, path) ?? path;
  if (typeof raw !== 'string') return path;
  return interpolate(raw, vars);
}

/**
 * Liste de chaînes (ex. bullets).
 */
export function translateList(locale: AppLocale, path: string): string[] {
  const raw = getPath(catalogs[locale], path) ?? getPath(catalogs.en, path);
  return Array.isArray(raw) ? (raw as string[]) : [];
}

export type DayId = 'jeu' | 'ven' | 'sam' | 'dim';

/**
 * Localise label/date d’un jour festival (id jeu/ven/sam/dim).
 */
export function localizeDayFields(
  locale: AppLocale,
  day: { id: string; label: string; date: string },
): { label: string; date: string } {
  const id = day.id as DayId;
  if (id === 'jeu' || id === 'ven' || id === 'sam' || id === 'dim') {
    return {
      label: translate(locale, `days.${id}.short`),
      date: translate(locale, `days.${id}.date`),
    };
  }
  return { label: day.label, date: day.date };
}
