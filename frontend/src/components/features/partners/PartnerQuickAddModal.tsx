"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getAdminPartners,
  getPartnerNodes,
  getPartnerCourseMeta,
  createAdminPartner,
  createPartnerNodeAdmin,
  createPartnerEventAdmin,
  createPartnerCourseAdmin,
} from "@/lib/api";
import type { PartnerMinimalApi, PartnerCourseMetaApi, PartnerNodeApi } from "@/types/partner";

export type PartnerQuickAddMode = "structure" | "event" | "course" | "festival";

function slugifyInput(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatApiError(raw: string): string {
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (typeof o.detail === "string") return o.detail;
    const nfe = o.non_field_errors;
    if (Array.isArray(nfe)) return nfe.map(String).join(" ");
    const parts = Object.entries(o).map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
      if (v && typeof v === "object") return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${String(v)}`;
    });
    return parts.join(" · ") || raw;
  } catch {
    return raw;
  }
}

const inputClass =
  "w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/30 focus:ring-2 focus:ring-amber-500 outline-none text-sm";
const selectClass =
  "w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm";

interface PartnerQuickAddModalProps {
  mode: PartnerQuickAddMode;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function PartnerQuickAddModal({ mode, open, onClose, onCreated }: PartnerQuickAddModalProps) {
  const t = useTranslations("pages.partnerForms");

  const [partners, setPartners] = useState<PartnerMinimalApi[]>([]);
  const [nodes, setNodes] = useState<PartnerNodeApi[]>([]);
  const [meta, setMeta] = useState<PartnerCourseMetaApi | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [partnerId, setPartnerId] = useState("");
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerSlug, setNewPartnerSlug] = useState("");
  const [newPartnerDesc, setNewPartnerDesc] = useState("");
  const [creatingPartner, setCreatingPartner] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [nodeType, setNodeType] = useState<"ROOT" | "BRANCH" | "EVENT">("BRANCH");
  const [parentId, setParentId] = useState("");

  const [eventType, setEventType] = useState<"FESTIVAL" | "PARTY" | "WORKSHOP">("PARTY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [nodeId, setNodeId] = useState("");

  const [styleId, setStyleId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetFields = useCallback(() => {
    setPartnerId("");
    setNewPartnerName("");
    setNewPartnerSlug("");
    setNewPartnerDesc("");
    setName("");
    setSlug("");
    setNodeType("BRANCH");
    setParentId("");
    setEventType("PARTY");
    setStartDate("");
    setEndDate("");
    setLocationName("");
    setDescription("");
    setNodeId("");
    setStyleId("");
    setLevelId("");
    setIsActive(true);
    setFormError(null);
    setLoadError(null);
  }, []);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [p, n] = await Promise.all([getAdminPartners(), getPartnerNodes()]);
      setPartners(p);
      setNodes(n);
      if (mode === "course") {
        const m = await getPartnerCourseMeta();
        setMeta(m);
        if (m.styles[0]) setStyleId(m.styles[0].id);
        if (m.levels[0]) setLevelId(m.levels[0].id);
      } else {
        setMeta(null);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    }
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    resetFields();
    void loadData();
  }, [open, loadData, resetFields]);

  const filteredNodes = useMemo(() => {
    if (!partnerId) return [];
    return nodes.filter((n) => n.partner === partnerId);
  }, [nodes, partnerId]);

  const modalTitle =
    mode === "structure"
      ? t("titleStructure")
      : mode === "course"
        ? t("titleCourse")
        : mode === "festival"
          ? t("titleFestival")
          : t("titleEvent");

  const onNameBlur = () => {
    if (!slug.trim() && name.trim()) setSlug(slugifyInput(name));
  };

  const handleCreatePartner = async () => {
    if (!newPartnerName.trim() || !newPartnerSlug.trim()) {
      setFormError(t("errorPartnerFields"));
      return;
    }
    setFormError(null);
    setCreatingPartner(true);
    try {
      const created = await createAdminPartner({
        name: newPartnerName.trim(),
        slug: slugifyInput(newPartnerSlug),
        description: newPartnerDesc.trim() || undefined,
      });
      setPartners((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setPartnerId(created.id);
      setNewPartnerName("");
      setNewPartnerSlug("");
      setNewPartnerDesc("");
    } catch (e) {
      setFormError(formatApiError(e instanceof Error ? e.message : String(e)));
    } finally {
      setCreatingPartner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!partnerId) {
      setFormError(t("errorPartnerRequired"));
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "structure") {
        const payload: Record<string, unknown> = {
          name: name.trim(),
          slug: slug.trim() ? slugifyInput(slug) : slugifyInput(name),
          type: nodeType,
          partner: partnerId,
          description: description,
          short_description: "",
          content: "",
          cta_text: "En savoir plus",
          cta_url: "",
        };
        if (parentId) payload.parent = parentId;
        await createPartnerNodeAdmin(payload);
      } else if (mode === "course") {
        if (!styleId || !levelId) {
          setFormError(t("errorStyleLevel"));
          setSubmitting(false);
          return;
        }
        const payload: Record<string, unknown> = {
          name: name.trim(),
          slug: slug.trim() ? slugifyInput(slug) : slugifyInput(name),
          partner: partnerId,
          style: styleId,
          level: levelId,
          description,
          is_active: isActive,
        };
        if (nodeId) payload.node = nodeId;
        await createPartnerCourseAdmin(payload);
      } else {
        const evType = mode === "festival" ? "FESTIVAL" : eventType;
        if (!startDate || !endDate) {
          setFormError(t("errorDates"));
          setSubmitting(false);
          return;
        }
        const payload: Record<string, unknown> = {
          name: name.trim(),
          slug: slug.trim() ? slugifyInput(slug) : slugifyInput(name),
          type: evType,
          start_date: startDate,
          end_date: endDate,
          partner: partnerId,
          description,
          location_name: locationName,
        };
        if (nodeId) payload.node = nodeId;
        await createPartnerEventAdmin(payload);
      }
      onCreated();
      onClose();
      resetFields();
    } catch (err) {
      setFormError(formatApiError(err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-quick-add-title"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-black shadow-2xl shadow-amber-900/20"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 id="partner-quick-add-title" className="text-lg font-black text-white">
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-white/40 hover:text-white"
            aria-label={t("cancel")}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {loadError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{loadError}</p>
          )}
          {formError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("partner")}</span>
            <select
              className={selectClass}
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              required
            >
              <option value="">{t("selectPartner")}</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          {partners.length === 0 && !loadError && (
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">{t("noPartners")}</p>
              <input
                className={inputClass}
                placeholder={t("newPartnerName")}
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
              />
              <input
                className={inputClass}
                placeholder={t("newPartnerSlug")}
                value={newPartnerSlug}
                onChange={(e) => setNewPartnerSlug(e.target.value)}
              />
              <textarea
                className={`${inputClass} min-h-[60px] resize-y`}
                placeholder={t("newPartnerDesc")}
                value={newPartnerDesc}
                onChange={(e) => setNewPartnerDesc(e.target.value)}
              />
              <button
                type="button"
                onClick={() => void handleCreatePartner()}
                disabled={creatingPartner}
                className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-black hover:bg-amber-500 disabled:opacity-50"
              >
                {creatingPartner ? t("creatingPartner") : t("createPartner")}
              </button>
            </div>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("name")}</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={onNameBlur}
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("slug")}</span>
            <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </label>

          {mode === "structure" && (
            <>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("nodeType")}</span>
                <select className={selectClass} value={nodeType} onChange={(e) => setNodeType(e.target.value as typeof nodeType)}>
                  <option value="ROOT">{t("typeRoot")}</option>
                  <option value="BRANCH">{t("typeBranch")}</option>
                  <option value="EVENT">{t("typeEventNode")}</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("parentNode")}</span>
                <select className={selectClass} value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">{t("none")}</option>
                  {filteredNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {(mode === "event" || mode === "festival") && (
            <>
              {mode === "event" && (
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("eventType")}</span>
                  <select
                    className={selectClass}
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as typeof eventType)}
                  >
                    <option value="FESTIVAL">{t("typeFestival")}</option>
                    <option value="PARTY">{t("typeParty")}</option>
                    <option value="WORKSHOP">{t("typeWorkshop")}</option>
                  </select>
                </label>
              )}
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("startDate")}</span>
                <input className={inputClass} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("endDate")}</span>
                <input className={inputClass} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("location")}</span>
                <input className={inputClass} value={locationName} onChange={(e) => setLocationName(e.target.value)} />
              </label>
            </>
          )}

          {mode === "course" && meta && (
            <>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("style")}</span>
                <select className={selectClass} value={styleId} onChange={(e) => setStyleId(e.target.value)} required>
                  {meta.styles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("level")}</span>
                <select className={selectClass} value={levelId} onChange={(e) => setLevelId(e.target.value)} required>
                  {meta.levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-white/30" />
                {t("active")}
              </label>
            </>
          )}

          {(mode === "event" || mode === "festival" || mode === "course") && partnerId && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("linkedStructure")}</span>
              <select className={selectClass} value={nodeId} onChange={(e) => setNodeId(e.target.value)}>
                <option value="">{t("none")}</option>
                {filteredNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">{t("description")}</span>
            <textarea className={`${inputClass} min-h-[80px] resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || !!loadError}
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? t("creating") : t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
