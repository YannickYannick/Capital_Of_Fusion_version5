"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  applyTranslationAdmin,
  previewTranslationAdmin,
  TranslateTargetLang,
  type AdminTranslatePreviewResponse,
} from "@/lib/adminApi";

export function AdminTranslateButton() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.user_type === "ADMIN";

  const [open, setOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [target, setTarget] = useState<TranslateTargetLang>("en");
  const [previews, setPreviews] = useState<Record<TranslateTargetLang, AdminTranslatePreviewResponse | null>>({
    en: null,
    es: null,
  });
  const [editedValues, setEditedValues] = useState<Record<TranslateTargetLang, string>>({
    en: "",
    es: "",
  });

  const model = "core.SiteConfiguration";

  const fieldToTranslate = useMemo(
    () => (pathname?.includes("/identite-cof/notre-histoire") ? "history_markdown" : "vision_markdown"),
    [pathname]
  );
  if (!isAdmin) return null;

  const runPreview = async () => {
    setPreviewLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const nextPreviews: Record<TranslateTargetLang, AdminTranslatePreviewResponse | null> = { en: null, es: null };
      const nextEdited: Record<TranslateTargetLang, string> = { ...editedValues };
      const res = await previewTranslationAdmin({
        model,
        field: fieldToTranslate,
        target,
      });
      nextPreviews[target] = res;
      nextEdited[target] = res.suggestion || "";
      setPreviews(nextPreviews);
      setEditedValues(nextEdited);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de prévisualisation");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setSuccess(null);
          setPreviews({ en: null, es: null });
          setEditedValues({ en: "", es: "" });
          setOpen(true);
        }}
        className="ml-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 hover:text-white text-sm font-semibold transition-all duration-200 hover:scale-105"
        aria-label="Traduction admin"
        title="Traduction admin"
      >
        🌐 Traduire
      </button>

      {open && (
        <AdminModal
          title="Comparaison traduction (admin)"
          loading={previewLoading || applyLoading}
          onClose={() => setOpen(false)}
          saveLabel="Appliquer"
          onSave={async () => {
            const preview = previews[target];
            if (!preview) {
              setError("Fais d'abord une prévisualisation.");
              return;
            }
            if (!(editedValues[target] || "").trim()) {
              setError("La valeur à appliquer est vide.");
              return;
            }
            setApplyLoading(true);
            setError(null);
            setSuccess(null);
            try {
              await applyTranslationAdmin({
                model,
                object_id: preview.object_id,
                field: fieldToTranslate,
                target,
                value: editedValues[target],
              });
              setSuccess("Traduction appliquée.");
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Erreur d'application");
            } finally {
              setApplyLoading(false);
            }
          }}
        >
          <div className="space-y-4">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm">
              Prévisualise une proposition Gemini puis te laisse décider quoi appliquer pour le champ :{" "}
              <b>{fieldToTranslate}</b>.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 text-sm text-white/80 font-medium">
                <input
                  type="radio"
                  checked={target === "en"}
                  onChange={() => setTarget("en")}
                  className="rounded"
                />
                Anglais
              </label>
              <label className="flex items-center gap-3 text-sm text-white/80 font-medium">
                <input
                  type="radio"
                  checked={target === "es"}
                  onChange={() => setTarget("es")}
                  className="rounded"
                />
                Espagnol
              </label>
            </div>

            <button
              type="button"
              onClick={runPreview}
              disabled={previewLoading || applyLoading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition disabled:opacity-40"
            >
              {previewLoading ? "⏳ Prévisualisation..." : "Prévisualiser"}
            </button>

            {previews[target] && (
              <div className="space-y-3 p-3 rounded-xl border border-white/10 bg-black/20">
                <div className="text-xs font-bold uppercase tracking-widest text-purple-300">
                  Langue {target.toUpperCase()}
                </div>
                <label className="block">
                  <span className="text-xs text-purple-300/80 font-semibold uppercase tracking-widest">Source FR</span>
                  <textarea
                    value={previews[target]?.source ?? ""}
                    readOnly
                    className="w-full mt-1 min-h-[90px] px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white/80 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-purple-300/80 font-semibold uppercase tracking-widest">
                    Actuel {target.toUpperCase()}
                  </span>
                  <textarea
                    value={previews[target]?.current_target ?? ""}
                    readOnly
                    className="w-full mt-1 min-h-[90px] px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white/80 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-purple-300/80 font-semibold uppercase tracking-widest">
                    Proposition éditable (sera appliquée)
                  </span>
                  <textarea
                    value={editedValues[target]}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        [target]: e.target.value,
                      }))
                    }
                    className="w-full mt-1 min-h-[120px] px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/25 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                  />
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-100 text-sm">
                {success}
              </div>
            )}
          </div>
        </AdminModal>
      )}
    </>
  );
}

