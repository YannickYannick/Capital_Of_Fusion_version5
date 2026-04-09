"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { OrganizationNodeApi } from "@/types/organization";
import { patchOrganizationNodeAdmin } from "@/lib/api";

interface LocalNodeChanges {
    orbit_radius?: number;
    orbit_speed?: number;
    planet_scale?: number;
    orbit_shape?: string;
    orbit_roundness?: number;
    orbit_position_y?: number;
    is_visible_3d?: boolean;
    /** Permet le passage à patchOrganizationNodeAdmin(payload: Record<string, unknown>) */
    [key: string]: number | string | boolean | undefined;
}

interface GlobalPlanetConfigPanelProps {
    nodes: OrganizationNodeApi[];
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

function NodeRow({
    node,
    changes,
    onChangeField,
}: {
    node: OrganizationNodeApi;
    changes: LocalNodeChanges;
    onChangeField: (field: keyof LocalNodeChanges, value: number | string | boolean) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const isVisible = changes.is_visible_3d ?? node.is_visible_3d;
    const orbitRadius = changes.orbit_radius ?? node.orbit_radius ?? 5;
    const orbitSpeed = changes.orbit_speed ?? node.orbit_speed ?? 0.1;
    const planetScale = changes.planet_scale ?? node.planet_scale ?? 0.6;
    const orbitShape = changes.orbit_shape ?? node.orbit_shape ?? "circle";
    const orbitRoundness = changes.orbit_roundness ?? node.orbit_roundness ?? 0.6;
    const orbitPositionY = changes.orbit_position_y ?? node.orbit_position_y ?? 0;

    const hasChanges = Object.keys(changes).length > 0;

    return (
        <li className={`rounded-xl border transition-colors ${hasChanges ? "border-purple-500/40 bg-purple-600/10" : "border-white/10 bg-white/5"}`}>
            {/* Header */}
            <div className="flex items-center gap-3 p-3">
                <button
                    type="button"
                    onClick={() => onChangeField("is_visible_3d", !isVisible)}
                    className={`text-lg transition ${isVisible ? "text-green-400" : "text-red-400/60"}`}
                    title={isVisible ? "Masquer" : "Afficher"}
                >
                    {isVisible ? "👁" : "🚫"}
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{node.name}</p>
                    <p className="text-white/40 text-xs truncate">{node.type}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="text-white/40 hover:text-white transition text-xs px-2"
                >
                    {expanded ? "▲" : "▼"}
                </button>
            </div>

            {/* Détails accordéon */}
            {expanded && (
                <div className="overflow-hidden animate-fadeIn">
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/10 mt-1 pt-3">
                            {/* Rayon d'orbite */}
                            <SliderRow
                                label="Rayon d'orbite"
                                value={orbitRadius}
                                min={3}
                                max={20}
                                step={0.5}
                                onChange={(v) => onChangeField("orbit_radius", v)}
                            />
                            {/* Hauteur (Y) */}
                            <SliderRow
                                label="Hauteur de l'orbite (Y)"
                                value={orbitPositionY}
                                min={-50}
                                max={50}
                                step={1}
                                onChange={(v) => onChangeField("orbit_position_y", v)}
                            />
                            {/* Vitesse orbitale */}
                            <SliderRow
                                label="Vitesse orbitale"
                                value={orbitSpeed}
                                min={0.05}
                                max={0.5}
                                step={0.01}
                                onChange={(v) => onChangeField("orbit_speed", v)}
                            />
                            {/* Taille planète */}
                            <SliderRow
                                label="Taille"
                                value={planetScale}
                                min={0.5}
                                max={2}
                                step={0.1}
                                onChange={(v) => onChangeField("planet_scale", v)}
                            />
                            {/* Forme orbite */}
                            <div>
                                <p className="text-xs text-white/50 mb-1.5">Forme de l'orbite</p>
                                <div className="flex gap-2">
                                    {["circle", "squircle"].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            className={`flex-1 py-1.5 rounded-lg text-xs border transition ${orbitShape === s
                                                ? "bg-purple-600/40 border-purple-500/60 text-white"
                                                : "bg-white/5 border-white/10 text-white/50"
                                                }`}
                                            onClick={() => onChangeField("orbit_shape", s)}
                                        >
                                            {s === "circle" ? "Cercle" : "Squircle"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {orbitShape === "squircle" && (
                                <SliderRow
                                    label="Arrondi"
                                    value={orbitRoundness}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    onChange={(v) => onChangeField("orbit_roundness", v)}
                                />
                            )}
                        </div>
                    </div>
                )}
        </li>
    );
}

function SliderRow({
    label,
    value,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-white/50">
                <span>{label}</span>
                <span className="font-mono text-white/70">{value.toFixed(step < 1 ? 2 : 1)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-purple-500 cursor-pointer"
            />
        </div>
    );
}

/**
 * Panneau de configuration par planète (slide-in depuis la droite, z-50).
 * Affiche la liste accordéon des planètes avec sliders pour les paramètres orbitaux.
 * Sauvegarde via PATCH /api/organization/nodes/{slug}/.
 */
export function GlobalPlanetConfigPanel({
    nodes,
    isOpen,
    onClose,
    onSaved,
}: GlobalPlanetConfigPanelProps) {
    const [allChanges, setAllChanges] = useState<Record<string, LocalNodeChanges>>({});
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

    const changeCount = Object.values(allChanges).filter((c) => Object.keys(c).length > 0).length;

    const handleChangeField = useCallback(
        (nodeId: string) =>
            (field: keyof LocalNodeChanges, value: number | string | boolean) => {
                setAllChanges((prev) => ({
                    ...prev,
                    [nodeId]: { ...prev[nodeId], [field]: value },
                }));
            },
        []
    );

    const handleSaveAll = useCallback(async () => {
        const changedNodes = Object.entries(allChanges).filter(([, ch]) => Object.keys(ch).length > 0);
        if (changedNodes.length === 0) return;

        setSaveStatus("saving");
        try {
            await Promise.all(
                changedNodes.map(async ([nodeId, changes]) => {
                    const node = nodes.find((n) => n.id === nodeId);
                    if (!node) return;
                    await patchOrganizationNodeAdmin(node.slug, changes);
                })
            );
            setSaveStatus("success");
            setAllChanges({});
            onSaved();
        } catch {
            setSaveStatus("error");
        } finally {
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    }, [allChanges, nodes, onSaved]);

    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [portalReady, setPortalReady] = useState(false);

    useEffect(() => {
        setPortalReady(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            setIsClosing(true);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    if (!shouldRender || !portalReady) return null;

    /**
     * Portail vers document.body : sinon le panneau reste sous la navbar (z-50) et sous les contrôles vidéo (z-50),
     * car tout Explore est dans un conteneur z-10 — les 1–2 premières lignes et le bas étaient non cliquables.
     * top-56 = sous le header large (h-56) ; bottom-24 = au-dessus des boutons qualité vidéo (bas-droite).
     */
    return createPortal(
        <>
            <div
                className={`fixed inset-0 z-[199] bg-black/40 backdrop-blur-sm ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
                onClick={onClose}
                aria-hidden
            />

            <aside
                className={`fixed top-56 right-0 bottom-24 z-[200] w-full max-w-[600px] bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col pointer-events-auto rounded-tl-2xl rounded-bl-2xl overflow-hidden ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"}`}
            >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
                            <div>
                                <h2 className="text-white font-bold text-lg">Configuration des Planètes</h2>
                                <p className="text-white/40 text-xs mt-0.5">{nodes.length} planètes chargées</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-white/50 hover:text-white text-2xl leading-none transition"
                            >
                                ×
                            </button>
                        </div>

                        {/* Liste */}
                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            <ul className="space-y-2">
                                {nodes.map((node) => (
                                    <NodeRow
                                        key={node.id}
                                        node={node}
                                        changes={allChanges[node.id] ?? {}}
                                        onChangeField={handleChangeField(node.id)}
                                    />
                                ))}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 px-4 py-4 border-t border-white/10 flex items-center justify-between gap-3">
                            <p className="text-xs text-white/40">
                                {changeCount > 0
                                    ? `${changeCount} planète${changeCount > 1 ? "s" : ""} modifiée${changeCount > 1 ? "s" : ""}`
                                    : "Aucune modification"}
                            </p>
                            <button
                                type="button"
                                onClick={handleSaveAll}
                                disabled={changeCount === 0 || saveStatus === "saving"}
                                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${saveStatus === "success"
                                    ? "bg-green-600 text-white"
                                    : saveStatus === "error"
                                        ? "bg-red-600 text-white"
                                        : saveStatus === "saving"
                                            ? "bg-purple-600/50 text-white/50 cursor-wait"
                                            : changeCount === 0
                                                ? "bg-white/10 text-white/30 cursor-not-allowed"
                                                : "bg-purple-600 hover:bg-purple-500 text-white"
                                    }`}
                            >
                                {saveStatus === "saving"
                                    ? "Sauvegarde…"
                                    : saveStatus === "success"
                                        ? "✓ Sauvegardé !"
                                        : saveStatus === "error"
                                            ? "✗ Erreur"
                                            : "Sauvegarder Tout"}
                            </button>
                        </div>
                    </aside>
                </>,
        document.body
    );
}
