import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Backend Django en prod (PostgreSQL Supabase via ORM). */
export const PRODUCTION_API_URL = 'https://capitaloffusionversion5-production.up.railway.app';

const LOCAL_ANDROID_EMULATOR = 'http://10.0.2.2:8000';
const LOCAL_LOOPBACK = 'http://127.0.0.1:8000';

export type ApiGetOptions = {
  params?: Record<string, string>;
  /** Annulation explicite (ex. démontage écran) — les AbortError sont ignorées côté hooks. */
  signal?: AbortSignal;
};

function devFallbackBaseUrl(): string {
  const onPhysicalDevice = Constants.isDevice;
  if (onPhysicalDevice) return PRODUCTION_API_URL;
  if (Platform.OS === 'android') return LOCAL_ANDROID_EMULATOR;
  return LOCAL_LOOPBACK;
}

/**
 * URL de base Django — les données passent par l'API, pas Supabase directement.
 * Sans EXPO_PUBLIC_API_URL : prod sur téléphone, localhost sur émulateur.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (__DEV__) return devFallbackBaseUrl();
  return PRODUCTION_API_URL;
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || /canceled|cancelled|aborted/i.test(error.message))
  );
}

/** GET JSON depuis l'API Django. */
export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const urlString = url.toString();

  const timeoutMs = 25_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(urlString, {
      headers: { Accept: 'application/json' },
      signal: options.signal ?? controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(`Délai dépassé (${timeoutMs / 1000}s)\n→ ${urlString}`);
    }
    const detail = error instanceof Error ? error.message : 'réseau';
    throw new Error(`${detail}\n→ ${urlString}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`API ${res.status} — ${urlString}`);
  }

  return res.json() as Promise<T>;
}

export { isAbortError };
