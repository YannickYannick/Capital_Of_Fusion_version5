/**
 * adminApi.ts — Fonctions CRUD admin vers le backend Django.
 * Toutes les fonctions ajoutent automatiquement le header Authorization: Token.
 */

import { getApiBaseUrl, getStoredToken } from "@/lib/api";

/** Header d'auth admin */
function authHeaders(): HeadersInit {
    const token = getStoredToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
    };
}

async function handleResponse(res: Response) {
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = (data && typeof data === "object" && "error" in data)
            ? String(data.error)
            : Object.values(data).flat().join(" ") || `Erreur ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function createEvent(payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/events/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateEvent(slug: string, payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/events/${encodeURIComponent(slug)}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteEvent(slug: string) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/events/${encodeURIComponent(slug)}/`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function createCourse(payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/courses/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateCourse(slug: string, payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/courses/${encodeURIComponent(slug)}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteCourse(slug: string) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/courses/${encodeURIComponent(slug)}/`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ─── Theory Lessons ───────────────────────────────────────────────────────────

export async function createTheoryLesson(payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/courses/theory/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateTheoryLesson(slug: string, payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/courses/theory/${encodeURIComponent(slug)}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteTheoryLesson(slug: string) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/courses/theory/${encodeURIComponent(slug)}/`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ─── Organization Nodes ───────────────────────────────────────────────────────

export async function updateOrganizationNode(slug: string, payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/organization/nodes/${encodeURIComponent(slug)}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function createProject(payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/projects/projects/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateProject(slug: string, payload: Record<string, unknown>) {
    const res = await fetch(`${getApiBaseUrl()}/api/projects/projects/${encodeURIComponent(slug)}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteProject(slug: string) {
    const res = await fetch(`${getApiBaseUrl()}/api/projects/projects/${encodeURIComponent(slug)}/`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ─── Modifications en attente (staff → admin) ──────────────────────────────────

export interface PendingContentEditApi {
    id: number;
    content_type: string;
    content_type_display: string;
    object_id: string;
    payload: Record<string, unknown>;
    status: string;
    requested_by: number;
    requested_by_username: string;
    reviewed_by: number | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export async function getPendingEdits(): Promise<PendingContentEditApi[]> {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/pending-edits/`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
}

export async function approvePendingEdit(id: number): Promise<PendingContentEditApi> {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/pending-edits/${id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ action: "approve" }),
    });
    return handleResponse(res);
}

export async function rejectPendingEdit(id: number): Promise<PendingContentEditApi> {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/pending-edits/${id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ action: "reject" }),
    });
    return handleResponse(res);
}

// ─── Traductions (admin) ─────────────────────────────────────────────────────
export type TranslateTargetLang = "en" | "es";

export interface AdminTranslateResponse {
    results: Record<
        TranslateTargetLang,
        | { status: "ok"; output: string }
        | { status: "error"; error: string }
    >;
}

export async function translateModelsAdmin(payload: {
    targets: TranslateTargetLang[];
    limit?: number;
    dry_run?: boolean;
    model?: string;
    fields?: string[];
}): Promise<AdminTranslateResponse> {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/translate/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res) as Promise<AdminTranslateResponse>;
}

export interface AdminTranslatePreviewResponse {
    model: string;
    object_id: number | string;
    field: string;
    target: TranslateTargetLang;
    source: string;
    current_target: string;
    suggestion: string;
}

export async function previewTranslationAdmin(payload: {
    model: string;
    object_id?: number | string;
    field: string;
    target: TranslateTargetLang;
    /** Texte FR du formulaire (même si non encore enregistré en base). */
    source_text?: string;
}): Promise<AdminTranslatePreviewResponse> {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/translate/preview/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res) as Promise<AdminTranslatePreviewResponse>;
}

/** Staff : proposition de traductions en attente validation admin. */
export async function submitTranslationPending(payload: {
    model: string;
    /** UUID string pour `core.Bulletin`. */
    object_id?: string;
    translation_proposal: Partial<
        Record<TranslateTargetLang, Record<string, string>>
    >;
}): Promise<{ ok: boolean; pending: boolean }> {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/translate/submit-pending/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res) as Promise<{ ok: boolean; pending: boolean }>;
}

export interface AdminTranslateApplyResponse {
    model: string;
    object_id: string | number;
    field: string;
    target: TranslateTargetLang;
    saved: boolean;
}

export async function applyTranslationAdmin(payload: {
    model: string;
    object_id?: number | string;
    field: string;
    target: TranslateTargetLang;
    value: string;
}): Promise<AdminTranslateApplyResponse> {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/translate/apply/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res) as Promise<AdminTranslateApplyResponse>;
}

/** GET /api/admin/config/ — textes EN/ES déjà enregistrés (Identité COF). */
export interface SiteIdentityTranslationsPayload {
    identity_translations: {
        vision_markdown: { en: string; es: string };
        history_markdown: { en: string; es: string };
    };
}

export async function getSiteIdentityTranslationsAdmin(): Promise<SiteIdentityTranslationsPayload> {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/config/`, {
        method: "GET",
        headers: authHeaders(),
    });
    return handleResponse(res) as Promise<SiteIdentityTranslationsPayload>;
}
