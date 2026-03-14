"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { patchSiteConfigHistory } from "@/lib/api";
import { markdownToHtml } from "@/lib/markdownToHtml";

/** Classes CSS pour le rendu du contenu markdown (titres, listes, liens, etc.) */
const proseClasses =
  "text-white/90 leading-relaxed [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg";

interface NotreHistoireClientProps {
  initialHistory: string;
}

export function NotreHistoireClient({ initialHistory }: NotreHistoireClientProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState(initialHistory);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialHistory);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";

  const handleStartEdit = () => {
    setEditValue(history);
    setSaveError(null);
    setSaveMessage(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditValue(history);
    setSaveError(null);
    setSaveMessage(null);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);
    try {
      const result = await patchSiteConfigHistory(editValue);
      if (result && typeof result === "object" && "pending" in result && result.pending) {
        setHistory(editValue);
        setEditing(false);
        setSaveMessage("Modification enregistrée. Elle sera visible après approbation par un administrateur.");
        return;
      }
      setHistory(editValue);
      setEditing(false);
      setSaveMessage("Enregistré.");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="prose prose-invert prose-lg max-w-none">
      <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Identité COF</p>
        <h1 className="text-5xl font-black text-white tracking-tight mb-4">
          Notre{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            histoire
          </span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto">
          L'histoire et les origines de Capital of Fusion.
        </p>
      </div>

      {canEdit && !editing && (
        <p className="mb-6">
          <button
            type="button"
            onClick={handleStartEdit}
            className="text-sm px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition cursor-pointer"
          >
            ✏️ Modifier l'histoire
          </button>
        </p>
      )}

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full min-h-[280px] px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm"
            placeholder="Contenu Markdown ou HTML de la page Notre histoire…"
            disabled={saving}
          />
          {saveError && (
            <p className="text-red-400 text-sm">{saveError}</p>
          )}
          {saveMessage && (
            <p className="text-green-400 text-sm">{saveMessage}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : history ? (
        <div
          className={`${proseClasses} animate-in fade-in duration-500`}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(history) }}
        />
      ) : (
        <p className="text-white/50 italic">
          Le contenu de notre histoire sera bientôt renseigné.
          {canEdit
            ? " Cliquez sur « Modifier l'histoire » pour le remplir."
            : " Vous pouvez le remplir dans l'admin du site (Configuration du site → Identité COF — Notre histoire)."}
        </p>
      )}
    </article>
  );
}
