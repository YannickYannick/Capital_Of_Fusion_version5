/**
 * Helpers API — base URL et appels vers le backend Django.
 * Base URL : NEXT_PUBLIC_API_URL (ex. http://localhost:8000).
 */

import type { MenuItemApi } from "@/types/menu";
import type { CourseApi } from "@/types/course";
import type { EventApi } from "@/types/event";
import type { OrganizationNodeApi } from "@/types/organization";

/**
 * Retourne l'URL de base de l'API (sans slash final).
 * En dev : http://localhost:8000 si NEXT_PUBLIC_API_URL non défini.
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

/**
 * Récupère les entrées de menu racine (avec children récursifs).
 * GET /api/menu/items/
 */
export async function getMenuItems(): Promise<MenuItemApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/menu/items/`);
  if (!res.ok) throw new Error(`Menu API error: ${res.status}`);
  return res.json();
}

/** Query params pour la liste des cours */
export interface CoursesQuery {
  style?: string;
  level?: string;
  node?: string;
}

/**
 * Liste des cours actifs. GET /api/courses/
 */
export async function getCourses(params?: CoursesQuery): Promise<CourseApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.style) search.set("style", params.style);
  if (params?.level) search.set("level", params.level);
  if (params?.node) search.set("node", params.node);
  const qs = search.toString();
  const url = qs ? `${base}/api/courses/?${qs}` : `${base}/api/courses/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Courses API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un cours par slug. GET /api/courses/<slug>/
 */
export async function getCourseBySlug(slug: string): Promise<CourseApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/courses/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Course API error: ${res.status}`);
  return res.json();
}

/** Query params pour la liste des événements */
export interface EventsQuery {
  type?: string;
  node?: string;
  upcoming?: boolean;
}

/**
 * Liste des événements. GET /api/events/
 */
export async function getEvents(params?: EventsQuery): Promise<EventApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.type) search.set("type", params.type);
  if (params?.node) search.set("node", params.node);
  if (params?.upcoming) search.set("upcoming", "1");
  const qs = search.toString();
  const url = qs ? `${base}/api/events/?${qs}` : `${base}/api/events/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Events API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un événement par slug. GET /api/events/<slug>/
 */
export async function getEventBySlug(slug: string): Promise<EventApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/events/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Event API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des noeuds d'organisation (Explore 3D). GET /api/organization/nodes/
 */
export async function getOrganizationNodes(): Promise<OrganizationNodeApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/organization/nodes/`);
  if (!res.ok) throw new Error(`Organization nodes API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un noeud par slug (overlay). GET /api/organization/nodes/<slug>/
 */
export async function getOrganizationNodeBySlug(
  slug: string
): Promise<OrganizationNodeApi> {
  const base = getApiBaseUrl();
  const res = await fetch(
    `${base}/api/organization/nodes/${encodeURIComponent(slug)}/`
  );
  if (!res.ok) throw new Error(`Organization node API error: ${res.status}`);
  return res.json();
}

/** Clé de stockage du token (localStorage) */
const AUTH_TOKEN_KEY = "bachata_api_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export interface LoginResponse {
  token: string;
}

/**
 * Connexion. POST /api/auth/login/
 */
export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Login error: ${res.status}`);
  }
  return res.json();
}

/**
 * Déconnexion. POST /api/auth/logout/ (avec token).
 */
export async function logout(): Promise<void> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) return;
  await fetch(`${base}/api/auth/logout/`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
  });
  clearStoredToken();
}
