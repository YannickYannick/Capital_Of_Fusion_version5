"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { getApiBaseUrl, getStoredToken } from "@/lib/api";
import type { StaffRole } from "@/contexts/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PendingUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    staff_role: string;
    date_joined: string;
}

// ─── Config rôles ─────────────────────────────────────────────────────────────

const STAFF_QUICK_LINKS: Record<string, { labelKey: string; href: string; icon: string }[]> = {
    TEACHER: [{ labelKey: "staff.links.myCourses", href: "/cours", icon: "🎓" }, { labelKey: "staff.links.theory", href: "/theorie", icon: "📖" }],
    ORGANIZER: [{ labelKey: "staff.links.events", href: "/evenements", icon: "📅" }],
    ARTIST: [{ labelKey: "staff.links.myArtistProfile", href: "/artistes", icon: "🎤" }],
    CARE: [{ labelKey: "staff.links.practitioners", href: "/care/praticiens", icon: "💆" }, { labelKey: "staff.links.care", href: "/care/soins", icon: "✨" }],
    SHOP: [{ labelKey: "staff.links.shop", href: "/shop", icon: "🛍️" }],
    COMMUNICATIONS: [{ labelKey: "staff.links.projects", href: "/projets", icon: "🚀" }],
};

// ─── Section Approbation Staff ─────────────────────────────────────────────────

function PendingStaffSection() {
    const t = useTranslations("dashboard");
    const [pending, setPending] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);

    const ROLE_LABELS: Record<string, string> = {
        TEACHER: t("roles.teacherWithIcon"),
        ORGANIZER: t("roles.organizerWithIcon"),
        ARTIST: t("roles.artistWithIcon"),
        CARE: t("roles.careWithIcon"),
        SHOP: t("roles.shopWithIcon"),
        COMMUNICATIONS: t("roles.commsWithIcon"),
    };

    const fetchPending = useCallback(async () => {
        const base = getApiBaseUrl();
        const token = getStoredToken();
        try {
            const res = await fetch(`${base}/api/auth/pending-staff/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (res.ok) setPending(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    async function handleAction(userId: number, action: "approve" | "reject") {
        setProcessing(userId);
        const base = getApiBaseUrl();
        const token = getStoredToken();
        await fetch(`${base}/api/auth/pending-staff/${userId}/`, {
            method: "PATCH",
            headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        });
        await fetchPending();
        setProcessing(null);
    }

    if (loading) return <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />;
    if (pending.length === 0) {
        return (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center text-white/30 text-sm">
                {t("pendingStaff.none")}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {pending.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-black text-amber-300">
                            {(u.first_name?.[0] ?? u.username[0]).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">{u.username}</p>
                            <p className="text-white/40 text-xs">{u.email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold border border-fuchsia-500/20">
                            {ROLE_LABELS[u.staff_role] ?? u.staff_role}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction(u.id, "approve")}
                            disabled={processing === u.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition disabled:opacity-50"
                        >
                            {t("pendingStaff.approve")}
                        </button>
                        <button
                            onClick={() => handleAction(u.id, "reject")}
                            disabled={processing === u.id}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-50"
                        >
                            {t("pendingStaff.reject")}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Section Admin ─────────────────────────────────────────────────────────────

function AdminDashboard({ username }: { username: string }) {
    const t = useTranslations("dashboard");
    const apiBase = getApiBaseUrl();
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">{t("admin.badge")}</p>
                <h2 className="text-2xl font-black text-white">{t("admin.hello", { username })}</h2>
                <p className="text-white/50 text-sm mt-1">{t("admin.subtitle")}</p>
            </div>


            {/* Approbation Staff */}
            <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                    ⏳ {t("pendingStaff.title")}
                </p>
                <PendingStaffSection />
            </div>

            {/* Modifications de contenu en attente */}
            <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">{t("contentEdits.title")}</p>
                <Link
                    href="/dashboard/pending-edits"
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-200 group"
                >
                    <span className="text-2xl">📝</span>
                    <div>
                        <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">{t("contentEdits.ctaTitle")}</p>
                        <p className="text-xs text-white/40 mt-0.5">{t("contentEdits.ctaDesc")}</p>
                    </div>
                    <span className="ml-auto text-white/40 group-hover:text-amber-400">→</span>
                </Link>
            </div>

            {/* Accès rapides */}
            <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">{t("quickAccess.title")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: t("quickAccess.djangoAdmin.label"), href: `${apiBase}/admin/`, icon: "⚙️", desc: t("quickAccess.djangoAdmin.desc"), external: true },
                        { label: t("quickAccess.users.label"), href: `${apiBase}/admin/users/user/`, icon: "👥", desc: t("quickAccess.users.desc"), external: true },
                        { label: t("quickAccess.projects.label"), href: "/projets", icon: "🚀", desc: t("quickAccess.projects.desc"), external: false },
                        { label: t("quickAccess.events.label"), href: "/evenements", icon: "📅", desc: t("quickAccess.events.desc"), external: false },
                        { label: t("quickAccess.courses.label"), href: "/cours", icon: "🎓", desc: t("quickAccess.courses.desc"), external: false },
                        { label: t("quickAccess.organization.label"), href: "/organisation", icon: "🪐", desc: t("quickAccess.organization.desc"), external: false },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-200 group"
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                                <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">{item.label}</p>
                                <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                            </div>
                            {item.external && <span className="ml-auto text-xs text-white/20">↗</span>}
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}

// ─── Section Staff ─────────────────────────────────────────────────────────────

function StaffDashboard({ username, staffRole }: { username: string; staffRole: StaffRole }) {
    const t = useTranslations("dashboard");
    const roleLabel = t(`roles.${(staffRole || "staff").toLowerCase()}` as any);
    const links = STAFF_QUICK_LINKS[staffRole] ?? [];
    const apiBase = getApiBaseUrl();
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/20">
                <p className="text-fuchsia-400 text-xs font-bold uppercase tracking-widest mb-1">{t("staff.badge", { role: roleLabel })}</p>
                <h2 className="text-2xl font-black text-white">{t("staff.hello", { username })}</h2>
                <p className="text-white/50 text-sm mt-1">{t("staff.subtitle")}</p>
            </div>
            <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">{t("quickAccess.title")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href}
                            className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all duration-200 group">
                            <span className="text-2xl">{link.icon}</span>
                            <span className="font-semibold text-white group-hover:text-fuchsia-300 transition-colors">{t(link.labelKey)}</span>
                        </Link>
                    ))}
                    <Link href="/dashboard/pending-edits"
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all duration-200 group">
                        <span className="text-2xl">📝</span>
                        <span className="font-semibold text-white group-hover:text-fuchsia-300 transition-colors">{t("staff.pendingEdits")}</span>
                    </Link>
                    <Link href={`${apiBase}/admin/`} target="_blank"
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all duration-200 group">
                        <span className="text-2xl">⚙️</span>
                        <span className="font-semibold text-white group-hover:text-fuchsia-300 transition-colors">{t("staff.dbMenu")}</span>
                        <span className="ml-auto text-xs text-white/20">↗</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Section Membre ────────────────────────────────────────────────────────────

function MemberDashboard({ username }: { username: string }) {
    const t = useTranslations("dashboard");
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">{t("member.badge")}</p>
                <h2 className="text-2xl font-black text-white">{t("member.welcome", { username })}</h2>
                <p className="text-white/50 text-sm mt-1">{t("member.subtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { label: t("member.cards.events.title"), href: "/evenements", icon: "📅", desc: t("member.cards.events.desc") },
                    { label: t("member.cards.courses.title"), href: "/cours", icon: "🎓", desc: t("member.cards.courses.desc") },
                    { label: t("member.cards.explore.title"), href: "/explore", icon: "🪐", desc: t("member.cards.explore.desc") },
                    { label: t("member.cards.projects.title"), href: "/projets", icon: "🚀", desc: t("member.cards.projects.desc") },
                ].map((item) => (
                    <Link key={item.href} href={item.href}
                        className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200 group">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                            <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{item.label}</p>
                            <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// ─── Page principale ───────────────────────────────────────────────────────────

/**
 * /dashboard — adapté au user_type (ADMIN/STAFF/MEMBER).
 * Redirige vers /login si non connecté.
 */
export default function DashboardPage() {
    const t = useTranslations("dashboard");
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace("/login");
    }, [loading, user, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-white/40 text-sm">{t("loading")}</p>
                </div>
            </div>
        );
    }

    const initials = (user.first_name?.[0] ?? user.username[0]).toUpperCase();

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg font-black text-purple-300">
                            {initials}
                        </div>
                        <div>
                            <p className="text-white font-bold">{user.username}</p>
                            <p className="text-white/40 text-xs">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={() => { logout(); router.push("/"); }}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                        {t("logout")}
                    </button>
                </div>

                {/* Vue selon rôle */}
                {user.user_type === "ADMIN" && <AdminDashboard username={user.username} />}
                {user.user_type === "STAFF" && <StaffDashboard username={user.username} staffRole={user.staff_role} />}
                {user.user_type === "MEMBER" && <MemberDashboard username={user.username} />}
            </div>
        </div>
    );
}
