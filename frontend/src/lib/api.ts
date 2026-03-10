/**
 * Helpers API — base URL et appels vers le backend Django.
 * Base URL : NEXT_PUBLIC_API_URL (ex. http://localhost:8000).
 */

import type { MenuItemApi } from "@/types/menu";
import type { CourseApi } from "@/types/course";
import type { TheoryLessonApi } from "@/types/course";
import type { EventApi } from "@/types/event";
import type { OrganizationNodeApi, PoleApi, StaffMemberApi } from "@/types/organization";
import type { ArtistApi } from "@/types/user";
import type { SiteConfigurationApi, BulletinApi, BulletinAdminApi } from "@/types/config";
import type { ProductCategoryApi, ProductApi } from "@/types/shop";
import type { PractitionerApi, CareServiceApi } from "@/types/care";
import type { ProjectCategoryApi, ProjectApi } from "@/types/projects";
import type { SubscriptionPassApi, TrainingSessionApi } from "@/types/trainings";
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

/**
 * Récupère les entrées de menu racine (avec children récursifs).
 * GET /api/menu/items/
 */
export async function getMenuItems(): Promise<MenuItemApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/menu/items/`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Menu API error: ${res.status}`);
  return res.json();
}

/**
 * Récupère la configuration globale du site (vidéos, titres).
 * GET /api/config/
 */
export async function getSiteConfig(): Promise<SiteConfigurationApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/config/`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Config API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des bulletins (Identité COF). GET /api/identite/bulletins/
 */
export async function getBulletins(): Promise<BulletinApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/identite/bulletins/`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Bulletins API error: ${res.status}`);
  return res.json();
}

/**
 * Détail d'un bulletin par slug. GET /api/identite/bulletins/<slug>/
 */
export async function getBulletinBySlug(slug: string): Promise<BulletinApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/identite/bulletins/${encodeURIComponent(slug)}/`, { next: { revalidate: 60 } });
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
  const res = await fetch(`${base}/api/admin/config/`, {
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
  const res = await fetch(`${base}/api/admin/identite/bulletins/${encodeURIComponent(slug)}/`, {
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
  const res = await fetch(`${base}/api/admin/identite/bulletins/${encodeURIComponent(slug)}/`, {
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
  const res = await fetch(`${base}/api/organization/nodes/`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Organization nodes API error: ${res.status}`);
  return res.json();
}

/**
 * Tous les noeuds pour l’organigramme (avec parent_slug). GET /api/organization/nodes/?for_structure=1
 */
export async function getOrganizationNodesForStructure(): Promise<OrganizationNodeApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/organization/nodes/?for_structure=1`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Organization structure API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des pôles avec nombre de membres (staff/admin). GET /api/organization/poles/
 */
export async function getPoles(): Promise<PoleApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/organization/poles/`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Poles API error: ${res.status}`);
  return res.json();
}

/**
 * Liste des membres du staff (Organisation). GET /api/organization/staff/
 * @param poleSlug - filtre optionnel par slug de pôle
 */
export async function getStaffMembers(poleSlug?: string): Promise<StaffMemberApi[]> {
  const base = getApiBaseUrl();
  const url = poleSlug
    ? `${base}/api/organization/staff/?pole=${encodeURIComponent(poleSlug)}`
    : `${base}/api/organization/staff/`;
  const res = await fetch(url, { cache: "no-store" });
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
  const res = await fetch(
    `${base}/api/organization/nodes/${encodeURIComponent(slug)}/`
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
export async function getProductCategories(): Promise<ProductCategoryApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/shop/categories/`);
  if (!res.ok) throw new Error(`Shop Categories API error: ${res.status}`);
  return res.json();
}

export async function getProducts(): Promise<ProductApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/shop/products/`);
  if (!res.ok) throw new Error(`Shop Products API error: ${res.status}`);
  return res.json();
}

// --- CARE ---
export async function getPractitioners(): Promise<PractitionerApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/care/practitioners/`);
  if (!res.ok) throw new Error(`Care Practitioners API error: ${res.status}`);
  return res.json();
}

export async function getCareServices(): Promise<CareServiceApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/care/services/`);
  if (!res.ok) throw new Error(`Care Services API error: ${res.status}`);
  return res.json();
}

// --- PROJECTS --- (404 = endpoint absent ou backend non configuré → tableaux vides)
export async function getProjectCategories(): Promise<ProjectCategoryApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/projects/categories/`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Project Categories API error: ${res.status}`);
  return res.json();
}

export async function getProjects(): Promise<ProjectApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/projects/projects/`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Projects API error: ${res.status}`);
  return res.json();
}

export async function getProjectBySlug(slug: string): Promise<ProjectApi> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/projects/projects/${encodeURIComponent(slug)}/`);
  if (!res.ok) throw new Error(`Project API error: ${res.status}`);
  return res.json();
}

// --- TRAININGS ---
export async function getSubscriptionPasses(): Promise<SubscriptionPassApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/trainings/passes/`);
  if (!res.ok) throw new Error(`Trainings Passes API error: ${res.status}`);
  return res.json();
}

export async function getTrainingSessions(): Promise<TrainingSessionApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/trainings/sessions/`);
  if (!res.ok) throw new Error(`Trainings Sessions API error: ${res.status}`);
  return res.json();
}

// --- EXPLORE PRESETS ---
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
