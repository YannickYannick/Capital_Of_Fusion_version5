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
