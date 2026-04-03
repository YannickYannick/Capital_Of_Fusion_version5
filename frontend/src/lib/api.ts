/**
 * Helpers API — base URL et appels vers le backend Django.
 * Base URL : NEXT_PUBLIC_API_URL (ex. http://localhost:8000).
 */

import type { MenuItemApi } from "@/types/menu";
import type { CourseApi, CourseListApi, SchedulePlanningApi, TheoryLessonApi } from "@/types/course";
import type { EventApi } from "@/types/event";
import type { OrganizationNodeApi, PoleApi, StaffMemberApi } from "@/types/organization";
import type { ArtistApi, DanceProfessionApi } from "@/types/user";
import type { SiteConfigurationApi, BulletinApi, BulletinAdminApi } from "@/types/config";
import type { ProductCategoryApi, ProductApi } from "@/types/shop";
import type { PractitionerApi, PractitionerListApi, ServiceCategoryApi, CareServiceApi } from "@/types/care";
import type { ProjectCategoryApi, ProjectApi } from "@/types/projects";
import type { SubscriptionPassApi, TrainingSessionApi, TrainingRegistrationApi } from "@/types/trainings";
import type { ExplorePresetApi } from "@/types/explore";
import type { PartnerNodeApi, PartnerEventApi, PartnerCourseApi } from "@/types/partner";

/**
 * Retourne l'URL de base de l'API (sans slash final).
 * En prod (Vercel) : NEXT_PUBLIC_API_URL doit être défini (ex. URL Railway).
 * En dev : http://localhost:8000 si non défini.
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

type ApiLocale = "fr" | "en" | "es";

async function getLocaleFromCookie(): Promise<ApiLocale | null> {
  // Côté client : `document.cookie`.
  if (typeof document !== "undefined") {
    const match = document.cookie
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("locale="));
    if (!match) return null;
    const value = match.split("=").slice(1).join("=").trim();
    if (value === "fr" || value === "en" || value === "es") return value;
    return null;
  }

  // Côté serveur : `next/headers` (pour que les Server Components
  // puissent appeler l'API Django avec `?lang=...`).
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const requested = cookieStore.get("locale")?.value;
    if (requested === "fr" || requested === "en" || requested === "es") return requested;
  } catch {
    // ignore : environnement non compatible
  }
  return null;
}

function addLangParam(url: string, lang: ApiLocale | null): string {
  if (!lang) return url;
  return url.includes("?") ? `${url}&lang=${encodeURIComponent(lang)}` : `${url}?lang=${encodeURIComponent(lang)}`;
}

/**
 * Récupère les entrées de menu racine (avec children récursifs).
 * GET /api/menu/items/
 */
export async function getMenuItems(): Promise<MenuItemApi[]> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/menu/items/`, lang);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Menu API error: ${res.status}`);
  return res.json();
}

/**
 * Récupère la configuration globale du site (vidéos, titres).
 * GET /api/config/
 */
export async function getSiteConfig(): Promise<SiteConfigurationApi> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/config/`, lang);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Config API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des bulletins (Identité COF). GET /api/identite/bulletins/
 */
export async function getBulletins(): Promise<BulletinApi[]> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/identite/bulletins/`, lang);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Bulletins API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un bulletin par slug. GET /api/identite/bulletins/<slug>/
 */
export async function getBulletinBySlug(slug: string): Promise<BulletinApi> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/identite/bulletins/${encodeURIComponent(slug)}/`, lang);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Bulletin API error: ${res.status}`);
  return res.json();
}

/**
 * Mise à jour de la vision (Notre vision). Staff/superuser.
 * Si staff : 202 + { pending: true, message } (en attente d'approbation). Si admin : 200 + config.
 * PATCH /api/admin/config/
 */
export async function patchSiteConfigVision(visionMarkdown: string): Promise<SiteConfigurationApi | { pending: true; message: string }> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const lang = (await getLocaleFromCookie()) ?? "fr";
  const url = addLangParam(`${base}/api/admin/config/`, lang);
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ vision_markdown: visionMarkdown }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && typeof data === "object" && "error" in data) ? String(data.error) : data?.detail || `Patch config API error: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Mise à jour de l'histoire (Notre histoire). Staff/superuser.
 * PATCH /api/admin/config/
 */
export async function patchSiteConfigHistory(historyMarkdown: string): Promise<SiteConfigurationApi | { pending: true; message: string }> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const lang = (await getLocaleFromCookie()) ?? "fr";
  const url = addLangParam(`${base}/api/admin/config/`, lang);
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ history_markdown: historyMarkdown }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && typeof data === "object" && "error" in data) ? String(data.error) : data?.detail || `Patch config API error: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Liste de tous les bulletins (dont brouillons) pour édition. Staff/superuser.
 * GET /api/admin/identite/bulletins/
 */
export async function getAdminBulletins(): Promise<BulletinAdminApi[]> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(`${base}/api/admin/identite/bulletins/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error(`Admin bulletins API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un bulletin pour édition (y compris non publié). Staff/superuser.
 * GET /api/admin/identite/bulletins/<slug>/
 */
export async function getAdminBulletinBySlug(slug: string): Promise<BulletinAdminApi> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const lang = (await getLocaleFromCookie()) ?? "fr";
  const url = addLangParam(
    `${base}/api/admin/identite/bulletins/${encodeURIComponent(slug)}/`,
    lang
  );
  const res = await fetch(url, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error(`Admin bulletin API error: ${res.status}`);
  return res.json();
}

/**
 * Création d'un bulletin. Staff/superuser.
 * POST /api/admin/identite/bulletins/
 */
export async function createBulletin(data: {
  title: string;
  slug: string;
  content_markdown?: string;
  published_at?: string | null;
  is_published?: boolean;
}): Promise<BulletinAdminApi> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(`${base}/api/admin/identite/bulletins/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Create bulletin API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Mise à jour d'un bulletin. Staff/superuser.
 * Si staff : 202 + { pending: true, message }. Si admin : 200 + bulletin.
 * PATCH /api/admin/identite/bulletins/<slug>/
 */
export async function patchBulletin(
  slug: string,
  data: Partial<Pick<BulletinAdminApi, "title" | "slug" | "content_markdown" | "published_at" | "is_published">>
): Promise<BulletinAdminApi | { pending: true; message: string }> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const lang = (await getLocaleFromCookie()) ?? "fr";
  const url = addLangParam(
    `${base}/api/admin/identite/bulletins/${encodeURIComponent(slug)}/`,
    lang
  );
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || body?.detail || `Patch bulletin API error: ${res.status}`);
  }
  return body;
}

/** Query params pour la liste des cours */
export interface CoursesQuery {
  style?: string;
  level?: string;
  node?: string;
  day?: number;
}

/**
 * Liste des cours actifs. GET /api/courses/
 */
export async function getCourses(params?: CoursesQuery): Promise<CourseListApi[]> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const search = new URLSearchParams();
  if (params?.style) search.set("style", params.style);
  if (params?.level) search.set("level", params.level);
  if (params?.node) search.set("node", params.node);
  if (params?.day !== undefined) search.set("day", params.day.toString());
  if (lang) search.set("lang", lang);
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
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/courses/${encodeURIComponent(slug)}/`, lang);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Course API error: ${res.status}`);
  return res.json();
}

/** Query params pour le planning des cours */
export interface SchedulesQuery {
  day?: number;
  style?: string;
  level?: string;
}

/**
 * Liste des horaires de cours (planning). GET /api/courses/schedules/
 */
export async function getCourseSchedules(params?: SchedulesQuery): Promise<SchedulePlanningApi[]> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const search = new URLSearchParams();
  if (params?.day !== undefined) search.set("day", params.day.toString());
  if (params?.style) search.set("style", params.style);
  if (params?.level) search.set("level", params.level);
  if (lang) search.set("lang", lang);
  const qs = search.toString();
  const url = qs ? `${base}/api/courses/schedules/?${qs}` : `${base}/api/courses/schedules/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Schedules API error: ${res.status}`);
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
  const lang = await getLocaleFromCookie();
  const search = new URLSearchParams();
  if (params?.type) search.set("type", params.type);
  if (params?.node) search.set("node", params.node);
  if (params?.upcoming) search.set("upcoming", "1");
  if (lang) search.set("lang", lang);
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
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/events/${encodeURIComponent(slug)}/`, lang);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Event API error: ${res.status}`);
  return res.json();
}

// Cache mémoire pour les nœuds (TTL 5 min) — évite un aller-retour Railway à chaque visite
let _nodesCacheData: import("@/types/organization").OrganizationNodeApi[] | null = null;
let _nodesCacheTs = 0;
const NODES_CACHE_TTL = 5 * 60 * 1000;

/**
 * Liste des noeuds d'organisation (Explore 3D). GET /api/organization/nodes/
 */
export async function getOrganizationNodes(): Promise<import("@/types/organization").OrganizationNodeApi[]> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/organization/nodes/`, lang);

  if (_nodesCacheData && Date.now() - _nodesCacheTs < NODES_CACHE_TTL) {
    return _nodesCacheData;
  }

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Organization nodes API error: ${res.status}`);
  const data = await res.json();
  _nodesCacheData = data;
  _nodesCacheTs = Date.now();
  return data;
}

/**
 * Précharge les nœuds en arrière-plan (ex: hover bouton Explore).
 */
export function prefetchOrganizationNodes(): void {
  getOrganizationNodes().catch(() => {});
}

/**
 * Tous les noeuds pour l’organigramme (avec parent_slug). GET /api/organization/nodes/?for_structure=1
 */
export async function getOrganizationNodesForStructure(): Promise<OrganizationNodeApi[]> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/organization/nodes/?for_structure=1`, lang);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Organization structure API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des pôles avec nombre de membres (staff/admin). GET /api/organization/poles/
 */
export async function getPoles(): Promise<PoleApi[]> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const url = addLangParam(`${base}/api/organization/poles/`, lang);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Poles API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des membres du staff (Organisation). GET /api/organization/staff/
 * @param poleSlug - filtre optionnel par slug de pôle
 */
export async function getStaffMembers(poleSlug?: string): Promise<StaffMemberApi[]> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const url = poleSlug
    ? `${base}/api/organization/staff/?pole=${encodeURIComponent(poleSlug)}`
    : `${base}/api/organization/staff/`;
  const res = await fetch(addLangParam(url, lang), { cache: "no-store" });
  if (!res.ok) throw new Error(`Staff API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un noeud par slug (overlay). GET /api/organization/nodes/<slug>/
 */
export async function getOrganizationNodeBySlug(
  slug: string
): Promise<OrganizationNodeApi> {
  const base = getApiBaseUrl();
  const lang = await getLocaleFromCookie();
  const res = await fetch(
    addLangParam(
      `${base}/api/organization/nodes/${encodeURIComponent(slug)}/`,
      lang
    )
  );
  if (!res.ok) throw new Error(`Organization node API error: ${res.status}`);
  return res.json();
}

// ——— Partners ———

/** Paramètres de requête pour la liste des événements partenaires (type, node, upcoming). */
export interface PartnerEventsQuery {
  type?: string;
  node?: string;
  upcoming?: boolean;
}

/** Paramètres de requête pour la liste des cours partenaires (style, level, node). */
export interface PartnerCoursesQuery {
  style?: string;
  level?: string;
  node?: string;
}

/**
 * Liste des structures partenaires. GET /api/partners/nodes/
 */
export async function getPartnerNodes(): Promise<PartnerNodeApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/partners/nodes/`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Partner nodes API error: ${res.status}`);
  return res.json();
}

/**
 * Structures partenaires pour annuaire (avec parent_slug). GET /api/partners/nodes/?for_structure=1
 */
export async function getPartnerNodesForStructure(): Promise<PartnerNodeApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/partners/nodes/?for_structure=1`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Partner structure API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'une structure partenaire par slug. GET /api/partners/nodes/<slug>/
 */
export async function getPartnerNodeBySlug(slug: string): Promise<PartnerNodeApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/partners/nodes/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Partner node API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des événements partenaires. GET /api/partners/events/
 */
export async function getPartnerEvents(params?: PartnerEventsQuery): Promise<PartnerEventApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.type) search.set("type", params.type);
  if (params?.node) search.set("node", params.node);
  if (params?.upcoming) search.set("upcoming", "1");
  const qs = search.toString();
  const url = qs ? `${base}/api/partners/events/?${qs}` : `${base}/api/partners/events/`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Partner events API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un événement partenaire par slug. GET /api/partners/events/<slug>/
 */
export async function getPartnerEventBySlug(slug: string): Promise<PartnerEventApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/partners/events/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Partner event API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des cours partenaires. GET /api/partners/courses/
 */
export async function getPartnerCourses(params?: PartnerCoursesQuery): Promise<PartnerCourseApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.style) search.set("style", params.style);
  if (params?.level) search.set("level", params.level);
  if (params?.node) search.set("node", params.node);
  const qs = search.toString();
  const url = qs ? `${base}/api/partners/courses/?${qs}` : `${base}/api/partners/courses/`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Partner courses API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un cours partenaire par slug. GET /api/partners/courses/<slug>/
 */
export async function getPartnerCourseBySlug(slug: string): Promise<PartnerCourseApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/partners/courses/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Partner course API error: ${res.status}`);
  return res.json();
}

/**
 * Mise à jour partielle d'un noeud (descriptions, etc.). Réservé staff.
 * PATCH /api/admin/organization/nodes/<slug>/
 */
export async function patchOrganizationNode(
  slug: string,
  data: Partial<Pick<OrganizationNodeApi, "description" | "short_description" | "content">>
): Promise<OrganizationNodeApi> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(
    `${base}/api/admin/organization/nodes/${encodeURIComponent(slug)}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Patch node API error: ${res.status}`);
  }
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
 * Connexion avec Google. POST /api/auth/google/
 * id_token = JWT renvoyé par le bouton Google (GoogleOAuthProvider).
 */
export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/auth/google/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Google login error: ${res.status}`);
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

/**
 * Liste des artistes. GET /api/users/artists/
 */
export async function getArtists(staffOnly?: boolean): Promise<ArtistApi[]> {
  const base = getApiBaseUrl();
  let url = `${base}/api/users/artists/`;
  if (staffOnly !== undefined) {
    url += `?staff_only=${staffOnly}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Artists API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un artiste par username. GET /api/users/artists/<username>/
 */
export async function getArtistByUsername(username: string): Promise<ArtistApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/users/artists/${encodeURIComponent(username)}/`);
  if (!res.ok) throw new Error(`Artist API error: ${res.status}`);
  return res.json();
}

/** Alias pour la compatibilité avec certaines pages */
export const getArtistBySlug = getArtistByUsername;

/**
 * Édition admin d'un artiste (staff/admin).
 * GET /api/admin/users/artists/<username>/
 */
export async function getArtistAdmin(username: string): Promise<{
  artist: ArtistApi;
  all_professions: DanceProfessionApi[];
}> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(`${base}/api/admin/users/artists/${encodeURIComponent(username)}/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error(`Artist admin API error: ${res.status}`);
  return res.json();
}

/**
 * PATCH /api/admin/users/artists/<username>/
 */
export async function patchArtistAdmin(
  username: string,
  payload: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    bio_en?: string;
    bio_es?: string;
    is_staff_member?: boolean;
    profession_ids?: string[];
  }
): Promise<ArtistApi> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(`${base}/api/admin/users/artists/${encodeURIComponent(username)}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return data as ArtistApi;
}

/**
 * Upload profile picture pour un artiste (via FormData/multipart).
 */
export async function uploadArtistProfilePicture(
  username: string,
  file: File
): Promise<ArtistApi> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const formData = new FormData();
  formData.append("profile_picture", file);
  const res = await fetch(`${base}/api/admin/users/artists/${encodeURIComponent(username)}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return data as ArtistApi;
}

/**
 * Création admin d'un artiste (staff/admin).
 * ADMIN : 201 + ArtistApi. STAFF : 202 + { pending: true, message }.
 * POST /api/admin/users/artists/
 */
export async function createArtistAdmin(payload: {
  username: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  bio_en?: string;
  bio_es?: string;
  is_staff_member?: boolean;
  profession_ids?: string[];
}): Promise<ArtistApi | { pending: true; message: string }> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(`${base}/api/admin/users/artists/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 202) return data as { pending: true; message: string };
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : data?.detail || `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return data as ArtistApi;
}

/**
 * Liste des professions de danse (pour les formulaires admin).
 * GET /api/admin/users/artists/professions/
 */
export async function getDanceProfessionsAdmin(): Promise<DanceProfessionApi[]> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(`${base}/api/admin/users/artists/professions/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error(`Professions API error: ${res.status}`);
  return res.json();
}

/**
 * PATCH /api/admin/organization/nodes/<slug>/ — modifier un nœud (admin direct, staff → file d'attente).
 */
export async function patchOrganizationNodeAdmin(
  slug: string,
  payload: Record<string, unknown>
): Promise<import("@/types/organization").OrganizationNodeApi | { pending: true; message: string }> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(`${base}/api/admin/organization/nodes/${encodeURIComponent(slug)}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 202) {
    return data as { pending: true; message: string };
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return data as OrganizationNodeApi;
}

/** Query params pour la liste des leçons de théorie */
export interface TheoryQuery {
  category?: string;
}

/**
 * Liste des leçons de théorie. GET /api/courses/theory/
 */
export async function getTheoryLessons(params?: TheoryQuery): Promise<TheoryLessonApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  const qs = search.toString();
  const url = qs ? `${base}/api/courses/theory/?${qs}` : `${base}/api/courses/theory/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Theory API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'une leçon de théorie par slug. GET /api/courses/theory/<slug>/
 */
export async function getTheoryLessonBySlug(slug: string): Promise<TheoryLessonApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/courses/theory/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Theory lesson API error: ${res.status}`);
  return res.json();
}

/**
 * ---------------------------------------------------------
 * NOUVELLES APIS (PHASE 9) - SHOP, CARE, PROJECTS, TRAININGS
 * ---------------------------------------------------------
 */

// --- SHOP ---

/** Liste des catégories de produits. GET /api/shop/categories/ */
export async function getProductCategories(): Promise<ProductCategoryApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/shop/categories/`);
  if (!res.ok) throw new Error(`Shop Categories API error: ${res.status}`);
  return res.json();
}

/** Détail d'une catégorie par slug. GET /api/shop/categories/<slug>/ */
export async function getProductCategoryBySlug(slug: string): Promise<ProductCategoryApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/shop/categories/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Shop Category API error: ${res.status}`);
  return res.json();
}

export interface ProductsQuery {
  category?: string;
  featured?: boolean;
}

/** Liste des produits. GET /api/shop/products/ */
export async function getProducts(params?: ProductsQuery): Promise<ProductApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.featured) search.set("featured", "1");
  const qs = search.toString();
  const url = qs ? `${base}/api/shop/products/?${qs}` : `${base}/api/shop/products/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Shop Products API error: ${res.status}`);
  return res.json();
}

/** Détail d'un produit par slug. GET /api/shop/products/<slug>/ */
export async function getProductBySlug(slug: string): Promise<ProductApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/shop/products/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Shop Product API error: ${res.status}`);
  return res.json();
}

// --- CARE ---

/** Liste des catégories de soins. GET /api/care/categories/ */
export async function getServiceCategories(): Promise<ServiceCategoryApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/care/categories/`);
  if (!res.ok) throw new Error(`Care Categories API error: ${res.status}`);
  return res.json();
}

/** Liste des praticiens. GET /api/care/practitioners/ */
export async function getPractitioners(): Promise<PractitionerListApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/care/practitioners/`);
  if (!res.ok) throw new Error(`Care Practitioners API error: ${res.status}`);
  return res.json();
}

/** Détail d'un praticien par slug. GET /api/care/practitioners/<slug>/ */
export async function getPractitionerBySlug(slug: string): Promise<PractitionerApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/care/practitioners/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Care Practitioner API error: ${res.status}`);
  return res.json();
}

export interface CareServicesQuery {
  category?: string;
  practitioner?: string;
}

/** Liste des services/soins. GET /api/care/services/ */
export async function getCareServices(params?: CareServicesQuery): Promise<CareServiceApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.practitioner) search.set("practitioner", params.practitioner);
  const qs = search.toString();
  const url = qs ? `${base}/api/care/services/?${qs}` : `${base}/api/care/services/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Care Services API error: ${res.status}`);
  return res.json();
}

// --- PROJECTS ---

/** Liste des catégories de projets. GET /api/projects/categories/ */
export async function getProjectCategories(): Promise<ProjectCategoryApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/projects/categories/`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Project Categories API error: ${res.status}`);
  return res.json();
}

export interface ProjectsQuery {
  status?: "IN_PROGRESS" | "UPCOMING" | "COMPLETED";
  category?: string;
}

/** Liste des projets. GET /api/projects/projects/ */
export async function getProjects(params?: ProjectsQuery): Promise<ProjectApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.category) search.set("category", params.category);
  const qs = search.toString();
  const url = qs ? `${base}/api/projects/projects/?${qs}` : `${base}/api/projects/projects/`;
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Projects API error: ${res.status}`);
  return res.json();
}

/** Détail d'un projet par slug. GET /api/projects/projects/<slug>/ */
export async function getProjectBySlug(slug: string): Promise<ProjectApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/projects/projects/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Project API error: ${res.status}`);
  return res.json();
}

// --- TRAININGS ---

/** Liste des pass d'abonnement. GET /api/trainings/passes/ */
export async function getSubscriptionPasses(): Promise<SubscriptionPassApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/trainings/passes/`);
  if (!res.ok) throw new Error(`Trainings Passes API error: ${res.status}`);
  return res.json();
}

export interface TrainingSessionsQuery {
  upcoming?: boolean;
  level?: string;
}

/** Liste des sessions de training. GET /api/trainings/sessions/ */
export async function getTrainingSessions(params?: TrainingSessionsQuery): Promise<TrainingSessionApi[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params?.upcoming) search.set("upcoming", "1");
  if (params?.level) search.set("level", params.level);
  const qs = search.toString();
  const url = qs ? `${base}/api/trainings/sessions/?${qs}` : `${base}/api/trainings/sessions/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Trainings Sessions API error: ${res.status}`);
  return res.json();
}

/** Détail d'une session par slug. GET /api/trainings/sessions/<slug>/ */
export async function getTrainingSessionBySlug(slug: string): Promise<TrainingSessionApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/trainings/sessions/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Training Session API error: ${res.status}`);
  return res.json();
}

/** Inscription à une session. POST /api/trainings/sessions/<slug>/register/ */
export async function registerToTrainingSession(slug: string): Promise<TrainingRegistrationApi> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  if (!token) throw new Error("Authentification requise");
  const res = await fetch(`${base}/api/trainings/sessions/${encodeURIComponent(slug)}/register/`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Registration error: ${res.status}`);
  }
  return res.json();
}

// --- EXPLORE PRESETS ---

/** Liste des presets Explore. GET /api/core/presets/ */
export async function getExplorePresets(): Promise<ExplorePresetApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/core/presets/`);
  if (!res.ok) throw new Error(`Explore Presets API error: ${res.status}`);
  return res.json();
}

/** Détail d'un preset Explore. GET /api/core/presets/<id>/ */
export async function getExplorePresetById(id: string): Promise<ExplorePresetApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/core/presets/${encodeURIComponent(id)}/`);
  if (!res.ok) throw new Error(`Explore Preset API error: ${res.status}`);
  return res.json();
}

/** Création d'un preset Explore. POST /api/core/presets/ */
export async function createExplorePreset(data: Partial<ExplorePresetApi>): Promise<ExplorePresetApi> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(`${base}/api/core/presets/`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Create Preset error: ${res.status}`);
  }
  return res.json();
}

/** Mise à jour partielle d'un preset Explore. PATCH /api/core/presets/<id>/ */
export async function updateExplorePreset(
  id: string,
  data: Partial<ExplorePresetApi>
): Promise<ExplorePresetApi> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(`${base}/api/core/presets/${encodeURIComponent(id)}/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Update Preset error: ${res.status}`);
  }
  return res.json();
}

/** Suppression d'un preset Explore. DELETE /api/core/presets/<id>/ */
export async function deleteExplorePreset(id: string): Promise<void> {
  const base = getApiBaseUrl();
  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(`${base}/api/core/presets/${encodeURIComponent(id)}/`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok && res.status !== 204) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Delete Preset error: ${res.status}`);
  }
}
