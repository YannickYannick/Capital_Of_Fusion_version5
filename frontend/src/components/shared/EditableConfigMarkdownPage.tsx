"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { markdownToHtml } from "@/lib/markdownToHtml";
import { patchSiteConfigMarkdownField } from "@/lib/api";

export type ExternalPageCta = {
  href: string;
  label: string;
  /** Par défaut : premier lien = primaire, suivants = secondaires. */
  variant?: "primary" | "secondary";
};

function normalizeExternalCtas(input?: ExternalPageCta | ExternalPageCta[]): ExternalPageCta[] {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}

function ExternalCtasRow({
  ctas,
  className,
}: {
  ctas: ExternalPageCta[];
  className?: string;
}) {
  if (ctas.length === 0) return null;
  return (
    <div
      className={[
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        className ?? "",
      ].join(" ")}
    >
      {ctas.map((c, idx) => {
        const inferred =
          c.variant ?? (idx === 0 ? ("primary" as const) : ("secondary" as const));
        const primary = inferred === "primary";
        return (
          <a
            key={`${c.href}-${idx}-${c.label}`}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "inline-flex w-full shrink-0 items-center justify-center text-center transition sm:w-auto",
              primary
                ? "rounded-2xl border-2 border-[#f3ac41] bg-[#f3ac41] px-10 py-4 text-lg font-black uppercase tracking-wider text-black shadow-[0_10px_40px_rgba(243,172,65,0.45)] hover:brightness-110"
                : "rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/15",
            ].join(" ")}
          >
            {c.label}
          </a>
        );
      })}
    </div>
  );
}

/** Prose lisible sur fond photo / vidéo (contraste + séparateurs visibles). */
const proseClasses =
  "leading-relaxed text-white/95 [&_p]:text-white/95 [&_li]:text-white/95 " +
  "[&_a]:text-purple-300 [&_a]:font-medium [&_a:hover]:underline [&_a:hover]:text-purple-200 " +
  "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl md:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] " +
  "[&_h3]:text-white [&_h3]:font-semibold [&_strong]:text-white [&_strong]:font-semibold " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:marker:text-purple-300/90 " +
  "[&_hr]:my-8 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-white/35 [&_hr]:to-transparent " +
  "[&_pre]:bg-black/50 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10 " +
  "[&_img]:my-8 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:border [&_img]:border-white/15";

export function EditableConfigMarkdownPage({
  eyebrow,
  title,
  subtitle,
  initialValue,
  field,
  emptyText,
  ctaBelowSubtitle,
  ctaAboveHero,
  ctaAfterHero,
  titleBeforeVideo,
  preface,
  collapsibleMarkdown,
  heroVideo,
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
    | "identite_adn_festival_markdown"
    | "support_faq_markdown"
    | "support_contact_markdown";
  emptyText: string;
  /** Liens très visibles au-dessus de la vidéo hero / du panneau (ex. inscriptions festival). */
  ctaAboveHero?: ExternalPageCta | ExternalPageCta[];
  /** Boutons sous le sous-titre (un ou plusieurs liens externes). */
  ctaBelowSubtitle?: ExternalPageCta | ExternalPageCta[];
  /** Boutons affichés APRÈS la vidéo hero, avant le panneau principal. */
  ctaAfterHero?: ExternalPageCta | ExternalPageCta[];
  /** Si true : eyebrow/titre/sous-titre s'affichent avant la vidéo hero (hors panneau). */
  titleBeforeVideo?: boolean;
  preface?: ReactNode;
  /** Affiche le corps Markdown derrière un bouton (réduit la hauteur de page en lecture seule). */
  collapsibleMarkdown?: {
    expandLabel: string;
    collapseLabel: string;
    /** Par défaut : replié. */
    defaultOpen?: boolean;
  };
  /** Bandeau vidéo au-dessus du panneau principal (ex. Street Bachata Battle). */
  heroVideo?: {
    src: string;
    ariaLabel?: string;
    /** Par défaut true : barre de lecture pour activer le son (l’autoplay reste muet). */
    controls?: boolean;
  };
}) {
  const markdownToggleId = useId();
  const markdownPanelId = useId();
  const { user } = useAuth();
  const router = useRouter();
  const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";

  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [markdownExpanded, setMarkdownExpanded] = useState(
    () => collapsibleMarkdown?.defaultOpen ?? false,
  );

  useEffect(() => {
    if (!editing) {
      setValue(initialValue);
      setEditValue(initialValue);
    }
  }, [initialValue, editing]);

  const html = markdownToHtml(value);
  const previewHtml = markdownToHtml(editValue);
  const ctasAbove = normalizeExternalCtas(ctaAboveHero);
  const ctasAfter = normalizeExternalCtas(ctaAfterHero);
  const ctasBelowSubtitle = normalizeExternalCtas(ctaBelowSubtitle);

  const titleBlock = (
    <>
      <p className="text-xs uppercase tracking-widest text-purple-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
        {title}
      </h1>
      <p className="mt-4 text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)] max-w-3xl">{subtitle}</p>
    </>
  );

  return (
    <div className="text-white">
      {ctasAbove.length > 0 ? (
        <div className="mb-10 rounded-2xl border border-white/15 bg-gradient-to-br from-purple-950/80 to-black/80 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-sm ring-1 ring-inset ring-white/10 md:p-8">
          <ExternalCtasRow ctas={ctasAbove} className="gap-4 sm:gap-4" />
        </div>
      ) : null}

      {titleBeforeVideo ? (
        <div className="mb-6 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-md px-5 py-7 md:px-9 md:py-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/10">
          {titleBlock}
        </div>
      ) : null}

      {heroVideo ? (
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10">
          <video
            className="mx-auto w-full max-h-[min(72vh,680px)] bg-black object-contain"
            src={heroVideo.src}
            playsInline
            muted
            loop
            autoPlay
            controls={heroVideo.controls ?? true}
            aria-label={heroVideo.ariaLabel || title}
          />
        </div>
      ) : null}

      {ctasAfter.length > 0 ? (
        <div className="mb-8 rounded-2xl border border-white/15 bg-gradient-to-br from-purple-950/80 to-black/80 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-sm ring-1 ring-inset ring-white/10 md:p-8">
          <ExternalCtasRow ctas={ctasAfter} className="gap-4 sm:gap-4" />
        </div>
      ) : null}

      <div
        className={[
          "rounded-2xl border border-white/15",
          "bg-black/65 backdrop-blur-md",
          "shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10",
          "px-5 py-8 md:px-9 md:py-10",
        ].join(" ")}
      >
        {!titleBeforeVideo ? titleBlock : null}

        {ctasBelowSubtitle.length > 0 ? (
          <div className={titleBeforeVideo ? "" : "mt-6"}>
            <ExternalCtasRow ctas={ctasBelowSubtitle} />
          </div>
        ) : null}

        {preface}

        {canEdit ? (
          <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-6">
            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditValue(value);
                  setSaveError(null);
                  setSaveMessage(null);
                  setEditing(true);
                }}
                className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition border border-white/15"
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
                  className="px-4 py-2 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white text-sm font-semibold transition disabled:opacity-60"
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
                  className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white/90 text-sm font-medium transition disabled:opacity-60"
                >
                  Annuler
                </button>
              </>
            )}
            {saveError ? <p className="w-full text-sm text-red-400">{saveError}</p> : null}
            {saveMessage ? <p className="w-full text-sm text-emerald-300">{saveMessage}</p> : null}
          </div>
        ) : null}

        {!editing ? (
          html ? (
            collapsibleMarkdown ? (
              <div className="mt-10">
                <button
                  type="button"
                  id={markdownToggleId}
                  aria-expanded={markdownExpanded}
                  aria-controls={markdownPanelId}
                  onClick={() => setMarkdownExpanded((o) => !o)}
                  className={[
                    "inline-flex w-full max-w-xl items-center justify-between gap-3 rounded-xl",
                    "border border-white/20 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white",
                    "shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm transition",
                    "hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300",
                  ].join(" ")}
                >
                  <span>
                    {markdownExpanded
                      ? collapsibleMarkdown.collapseLabel
                      : collapsibleMarkdown.expandLabel}
                  </span>
                  <span
                    aria-hidden
                    className={[
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/30 text-lg text-white/90 transition-transform",
                      markdownExpanded ? "rotate-180" : "",
                    ].join(" ")}
                  >
                    ▼
                  </span>
                </button>
                <div
                  id={markdownPanelId}
                  role="region"
                  aria-labelledby={markdownToggleId}
                  className={markdownExpanded ? "mt-5" : "hidden"}
                >
                  <div className={proseClasses} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              </div>
            ) : (
              <div className={`mt-10 ${proseClasses}`} dangerouslySetInnerHTML={{ __html: html }} />
            )
          ) : preface ? null : (
            <p className="mt-10 text-white/70">{emptyText}</p>
          )
        ) : (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/12 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Markdown</p>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full min-h-[320px] bg-transparent text-white/95 text-sm outline-none resize-y"
                placeholder="## Titre\n\nContenu..."
              />
            </div>
            <div className="rounded-xl border border-white/12 bg-black/40 p-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Aperçu</p>
              {previewHtml ? (
                <div className={proseClasses} dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <p className="text-white/60 text-sm">Aperçu…</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

