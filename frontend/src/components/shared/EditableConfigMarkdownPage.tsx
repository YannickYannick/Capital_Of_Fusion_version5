"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { markdownToHtml } from "@/lib/markdownToHtml";
import { patchSiteConfigMarkdownField } from "@/lib/api";

const proseClasses =
  "text-white/90 leading-relaxed [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg [&_img]:my-8 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:border [&_img]:border-white/10";

export function EditableConfigMarkdownPage({
  eyebrow,
  title,
  subtitle,
  initialValue,
  field,
  emptyText,
  ctaBelowSubtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  initialValue: string;
  field:
    | "festival_planning_navettes_markdown"
    | "festival_acces_venue_markdown"
    | "festival_jack_n_jill_markdown"
    | "festival_all_star_street_battle_markdown"
    | "festival_book_your_hotel_markdown"
    | "festival_notre_programme_markdown"
    | "support_faq_markdown"
    | "support_contact_markdown";
  emptyText: string;
  /** Bouton d’action sous le sous-titre (ex. lien externe go&dance), style aligné sur la landing. */
  ctaBelowSubtitle?: { href: string; label: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";

  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setValue(initialValue);
      setEditValue(initialValue);
    }
  }, [initialValue, editing]);

  const html = markdownToHtml(value);
  const previewHtml = markdownToHtml(editValue);

  return (
    <div className="text-white">
      <p className="text-xs uppercase tracking-widest text-purple-300/90">{eyebrow}</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-4 text-white/60">{subtitle}</p>

      {ctaBelowSubtitle ? (
        <div className="mt-6">
          <a
            href={ctaBelowSubtitle.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-6 py-3 rounded-lg bg-[#f3ac41] border border-[#f3ac41] hover:brightness-110 text-black font-semibold transition text-center"
          >
            {ctaBelowSubtitle.label}
          </a>
        </div>
      ) : null}

      {canEdit ? (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setEditValue(value);
                setSaveError(null);
                setSaveMessage(null);
                setEditing(true);
              }}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-sm font-medium transition border border-white/10"
            >
              ✏️ Modifier
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  setSaveError(null);
                  setSaveMessage(null);
                  try {
                    const result = await patchSiteConfigMarkdownField({ [field]: editValue } as any);
                    if (result && typeof result === "object" && "pending" in result && (result as any).pending) {
                      setValue(editValue);
                      setEditing(false);
                      setSaveMessage((result as any).message || "Modification enregistrée.");
                      router.refresh();
                      return;
                    }
                    setValue(editValue);
                    setEditing(false);
                    setSaveMessage("Enregistré.");
                    router.refresh();
                  } catch (e) {
                    setSaveError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
                  } finally {
                    setSaving(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-sm font-semibold transition disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditValue(value);
                  setEditing(false);
                  setSaveError(null);
                  setSaveMessage(null);
                }}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition disabled:opacity-60"
              >
                Annuler
              </button>
            </>
          )}
          {saveError ? <p className="text-sm text-red-400">{saveError}</p> : null}
          {saveMessage ? <p className="text-sm text-emerald-300">{saveMessage}</p> : null}
        </div>
      ) : null}

      {!editing ? (
        html ? (
          <div className={`mt-10 ${proseClasses}`} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="mt-10 text-white/50">{emptyText}</p>
        )
      ) : (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Markdown</p>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-h-[320px] bg-transparent text-white/90 text-sm outline-none resize-y"
              placeholder="## Titre\n\nContenu..."
            />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Aperçu</p>
            {previewHtml ? (
              <div className={proseClasses} dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className="text-white/50 text-sm">Aperçu…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

