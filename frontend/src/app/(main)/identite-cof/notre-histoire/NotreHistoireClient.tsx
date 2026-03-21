"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { patchSiteConfigHistory } from "@/lib/api";
import { markdownToHtml } from "@/lib/markdownToHtml";
import { EditFormActionBar } from "@/components/admin/translation/EditFormActionBar";
import { SiteIdentityTranslationModal } from "@/components/admin/translation/SiteIdentityTranslationModal";

const proseClasses =
    "text-white/90 leading-relaxed [&_a]:text-purple-400 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg";

interface NotreHistoireClientProps {
    initialHistory: string;
}

export function NotreHistoireClient({ initialHistory }: NotreHistoireClientProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState(initialHistory);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(initialHistory);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [includeInTranslation, setIncludeInTranslation] = useState(false);
    const [translationModal, setTranslationModal] = useState<"ai" | "manual" | null>(null);

    const canEdit = user?.user_type === "STAFF" || user?.user_type === "ADMIN";
    const isAdmin = user?.user_type === "ADMIN";

    useEffect(() => {
        if (!editing) {
            setHistory(initialHistory);
            setEditValue(initialHistory);
        }
    }, [initialHistory, editing]);

    const handleStartEdit = () => {
        setEditValue(history);
        setSaveError(null);
        setSaveMessage(null);
        setIncludeInTranslation(false);
        setEditing(true);
    };

    const handleCancel = () => {
        setEditValue(history);
        setSaveError(null);
        setSaveMessage(null);
        setIncludeInTranslation(false);
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
                router.refresh();
                return;
            }
            setHistory(editValue);
            setEditing(false);
            setSaveMessage("Enregistré.");
            router.refresh();
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const openTranslate = (mode: "ai" | "manual") => {
        if (!editValue.trim()) {
            setSaveError("Renseignez d’abord le texte français à traduire.");
            return;
        }
        setSaveError(null);
        setTranslationModal(mode);
    };

    return (
        <article className="prose prose-invert prose-lg max-w-none">
            <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Identité COF</p>
                <h1 className="text-5xl font-black text-white tracking-tight mb-4">
                    Notre{" "}
                    <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        histoire
                    </span>
                </h1>
                <p className="text-white/60 max-w-xl mx-auto">
                    L’histoire et le parcours de Capital of Fusion.
                </p>
            </div>

            {canEdit && !editing && (
                <p className="mb-6">
                    <button
                        type="button"
                        onClick={handleStartEdit}
                        className="text-sm px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition"
                    >
                        ✏️ Modifier l&apos;histoire
                    </button>
                </p>
            )}

            {editing ? (
                <div className="space-y-3">
                    <label className="flex items-start gap-3 text-sm text-white/90">
                        <input
                            type="checkbox"
                            checked={includeInTranslation}
                            onChange={(e) => setIncludeInTranslation(e.target.checked)}
                            className="mt-1 rounded border-white/30"
                        />
                        <span>Inclure ce champ dans la traduction (anglais / espagnol)</span>
                    </label>
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full min-h-[280px] px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm"
                        placeholder="Contenu Markdown ou HTML de la page Notre histoire…"
                        disabled={saving}
                    />
                    {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
                    {saveMessage && <p className="text-green-400 text-sm">{saveMessage}</p>}
                    <EditFormActionBar
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onTranslateAi={() => openTranslate("ai")}
                        onTranslateManual={() => openTranslate("manual")}
                        translateDisabled={!includeInTranslation}
                        saving={saving}
                    />
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

            {translationModal && (
                <SiteIdentityTranslationModal
                    open={!!translationModal}
                    onClose={() => setTranslationModal(null)}
                    field="history_markdown"
                    sourceFr={editValue}
                    isAdmin={isAdmin}
                    mode={translationModal}
                    onSuccess={() => router.refresh()}
                />
            )}
        </article>
    );
}
