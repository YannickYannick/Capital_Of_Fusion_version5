"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getPendingEdits, approvePendingEdit, rejectPendingEdit, type PendingContentEditApi } from "@/lib/adminApi";

export default function PendingEditsPage() {
  const { user, loading: authLoading } = useAuth();
  const [edits, setEdits] = useState<PendingContentEditApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.user_type === "ADMIN";

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    getPendingEdits()
      .then(setEdits)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleApprove(id: number) {
    setProcessing(id);
    try {
      await approvePendingEdit(id);
      setEdits((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(id: number) {
    setProcessing(id);
    try {
      await rejectPendingEdit(id);
      setEdits((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setProcessing(null);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-white/50 hover:text-white text-sm mb-6 inline-block transition-colors"
        >
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">
          Modifications en attente
        </h1>
        <p className="text-white/50 text-sm mb-8">
          {isAdmin
            ? "Demandes de modification envoyées par le staff. Approuvez ou refusez pour les appliquer au site."
            : "Vos demandes de modification en attente d'approbation par un administrateur."}
        </p>

        {error && (
          <p className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
        ) : edits.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center text-white/40">
            Aucune modification en attente.
          </div>
        ) : (
          <ul className="space-y-4">
            {edits.map((edit) => (
              <li
                key={edit.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {edit.content_type_display}
                    {edit.object_id ? ` — ${edit.object_id}` : " (Configuration)"}
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    Demandé par <span className="text-white/70">{edit.requested_by_username}</span>
                    {" · "}
                    <span className="text-white/40">
                      {new Date(edit.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(edit.id)}
                      disabled={processing === edit.id}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-semibold hover:bg-emerald-500/30 transition disabled:opacity-50"
                    >
                      {processing === edit.id ? "…" : "Approuver"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(edit.id)}
                      disabled={processing === edit.id}
                      className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
