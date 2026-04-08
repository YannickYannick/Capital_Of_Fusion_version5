"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getApiBaseUrl, getStoredToken, clearStoredToken } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserType = "ADMIN" | "STAFF" | "MEMBER";
export type StaffRole =
    | "TEACHER"
    | "ORGANIZER"
    | "ARTIST"
    | "CARE"
    | "SHOP"
    | "COMMUNICATIONS"
    | "";

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: UserType;
    staff_role: StaffRole;
    is_vibe: boolean;
    /** Aligné sur Django — voir /api/auth/me/ */
    is_staff?: boolean;
    is_superuser?: boolean;
}

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    logout: () => void;
    refresh: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: true,
    logout: () => { },
    refresh: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        const token = getStoredToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const base = getApiBaseUrl();
            const res = await fetch(`${base}/api/auth/me/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data as AuthUser);
            } else {
                // Token invalide ou expiré
                clearStoredToken();
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const logout = useCallback(() => {
        clearStoredToken();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout, refresh: fetchMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
