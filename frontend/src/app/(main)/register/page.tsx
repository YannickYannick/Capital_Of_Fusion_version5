"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiBaseUrl, setStoredToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const STAFF_ROLES = [
    { value: "TEACHER", label: "🎓 Enseignant(e)" },
    { value: "ORGANIZER", label: "📅 Organisateur / Organisatrice" },
    { value: "ARTIST", label: "🎤 Artiste" },
    { value: "CARE", label: "💆 Praticien(ne) / Care" },
    { value: "SHOP", label: "🛍️ Boutique" },
    { value: "COMMUNICATIONS", label: "📢 Communication" },
];

type RegisterType = "MEMBER" | "STAFF";
type Step = "type" | "form" | "pending";

/**
 * Page /register — 2 types d'inscription :
 * - Membre : activé immédiatement, redirigé vers /dashboard
 * - Staff CoF : en attente de validation Admin
 */
export default function RegisterPage() {
    const router = useRouter();
    const { refresh } = useAuth();

    const [step, setStep] = useState<Step>("type");
    const [userType, setUserType] = useState<RegisterType>("MEMBER");

    // Champs formulaire
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [staffRole, setStaffRole] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ─── Étape 1 — choix du type ────────────────────────────────────────────────
    if (step === "type") {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-10">
                        <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">Capital of Fusion</p>
                        <h1 className="text-3xl font-black text-white">Rejoindre la communauté</h1>
                        <p className="mt-2 text-white/50 text-sm">Quel type de compte souhaitez-vous créer ?</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Membre */}
                        <button
                            onClick={() => { setUserType("MEMBER"); setStep("form"); }}
                            className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 text-left group"
                        >
                            <span className="text-4xl">👋</span>
                            <div>
                                <p className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">Membre</p>
                                <p className="text-sm text-white/50 mt-1">
                                    Accède aux événements, cours et à l'univers Capital of Fusion.
                                    <br /><strong className="text-emerald-400">Activé immédiatement.</strong>
                                </p>
                            </div>
                        </button>

                        {/* Staff CoF */}
                        <button
                            onClick={() => { setUserType("STAFF"); setStep("form"); }}
                            className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all duration-200 text-left group"
                        >
                            <span className="text-4xl">🎯</span>
                            <div>
                                <p className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors">Staff CoF</p>
                                <p className="text-sm text-white/50 mt-1">
                                    Tu fais partie de l'équipe et tu veux gérer du contenu.
                                    <br /><strong className="text-amber-400">Requiert une validation Admin.</strong>
                                </p>
                            </div>
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-white/40">
                        Déjà un compte ?{" "}
                        <Link href="/login" className="text-purple-300 hover:underline">Se connecter</Link>
                    </p>
                </div>
            </div>
        );
    }

    // ─── Étape 3 — En attente de validation ─────────────────────────────────────
    if (step === "pending") {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center">
                    <div className="text-6xl mb-6">⏳</div>
                    <h2 className="text-2xl font-black text-white mb-3">Demande envoyée !</h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                        Ta demande de compte <strong className="text-fuchsia-300">Staff CoF</strong> a bien été reçue.
                        Un administrateur va la valider.{" "}
                        Tu recevras une confirmation dès que ton compte sera actif.
                    </p>
                    <Link
                        href="/"
                        className="mt-8 inline-block px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition"
                    >
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    // ─── Étape 2 — Formulaire ────────────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== password2) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const base = getApiBaseUrl();
            const res = await fetch(`${base}/api/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    user_type: userType,
                    staff_role: userType === "STAFF" ? staffRole : "",
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                const messages = Object.values(data).flat().join(" ");
                throw new Error(messages || "Erreur lors de l'inscription.");
            }
            if (data.account_status === "PENDING") {
                // Staff → en attente
                setStep("pending");
            } else {
                // Membre → token immédiat
                setStoredToken(data.token);
                await refresh();
                router.push("/dashboard");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    }

    const isStaff = userType === "STAFF";

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => setStep("type")}
                        className="text-white/40 hover:text-white/70 text-sm mb-4 flex items-center gap-1 mx-auto transition"
                    >
                        ← Retour
                    </button>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 ${isStaff
                            ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                        {isStaff ? "🎯 Staff Capital of Fusion" : "👋 Compte Membre"}
                    </div>
                    <h1 className="text-2xl font-black text-white">Créer mon compte</h1>
                    {isStaff && (
                        <p className="text-amber-400/80 text-xs mt-2">⚠️ Ce compte sera en attente de validation Admin</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="text-xs text-white/60 font-medium">Prénom</span>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 outline-none transition text-sm"
                                placeholder="Jean" autoComplete="given-name" />
                        </label>
                        <label className="block">
                            <span className="text-xs text-white/60 font-medium">Nom</span>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 outline-none transition text-sm"
                                placeholder="Dupont" autoComplete="family-name" />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-xs text-white/60 font-medium">Identifiant *</span>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                            className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 outline-none transition"
                            placeholder="nom_utilisateur" autoComplete="username" />
                    </label>

                    <label className="block">
                        <span className="text-xs text-white/60 font-medium">Email *</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 outline-none transition"
                            placeholder="email@exemple.fr" autoComplete="email" />
                    </label>

                    {isStaff && (
                        <label className="block">
                            <span className="text-xs text-white/60 font-medium">Rôle *</span>
                            <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} required
                                className="mt-1 w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition">
                                <option value="">-- Choisir un rôle --</option>
                                {STAFF_ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    <label className="block">
                        <span className="text-xs text-white/60 font-medium">Mot de passe *</span>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                            className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 outline-none transition"
                            placeholder="••••••••" autoComplete="new-password" />
                    </label>

                    <label className="block">
                        <span className="text-xs text-white/60 font-medium">Confirmer le mot de passe *</span>
                        <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required
                            className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 outline-none transition"
                            placeholder="••••••••" autoComplete="new-password" />
                    </label>

                    <button type="submit" disabled={loading}
                        className={`w-full py-3 rounded-xl text-white font-semibold transition disabled:opacity-50 mt-2 ${isStaff
                                ? "bg-fuchsia-600 hover:bg-fuchsia-500"
                                : "bg-purple-600 hover:bg-purple-500"
                            }`}>
                        {loading ? "Création…" : isStaff ? "Envoyer ma demande" : "Créer mon compte"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-white/40">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="text-purple-300 hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    );
}
