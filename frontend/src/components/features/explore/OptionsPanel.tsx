"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";

interface OptionsPanelProps {
    onOpenPlanetConfig: () => void;
}

function Slider({
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
            <div className="flex items-center justify-between text-xs text-white/60 gap-2">
                <span className="flex-1 min-w-0 truncate">{label}</span>
                <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
                    }}
                    className="w-16 px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white/90 font-mono text-xs text-right focus:outline-none focus:border-purple-500/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
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

function ToggleBtn({
    label,
    active,
    onClick,
    icon,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    icon?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${active
                ? "bg-purple-600/30 border-purple-500/50 text-white"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white/80 hover:bg-white/10"
                }`}
        >
            {icon && <span className="mr-1.5">{icon}</span>}
            {label}
        </button>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-t border-white/10 pt-2">
            <button
                type="button"
                className="w-full flex items-center justify-between text-xs font-semibold text-white/50 uppercase tracking-wider mb-2"
                onClick={() => setOpen((v) => !v)}
            >
                <span>{title}</span>
                <span className="text-white/30">{open ? "▲" : "▼"}</span>
            </button>
            {open && <div className="flex flex-col gap-2">{children}</div>}
        </div>
    );
}

/**
 * Panneau d'options fixe (droite, z-20) pour contrôler la scène 3D en temps réel.
 */
export function OptionsPanel({ onOpenPlanetConfig }: OptionsPanelProps) {
    const [visible, setVisible] = useState(true);
    const opts = usePlanetsOptions();

    return (
        <>
            {/* Toggle button */}
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="fixed top-24 right-4 z-30 p-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-black/60 transition shadow-lg"
                title="Options 3D"
            >
                ⚙️
            </button>

            <AnimatePresence>
                {visible && (
                    <motion.aside
                        key="options-panel"
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-24 right-14 z-20 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl text-sm p-4 flex flex-col gap-3"
                    >
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Options 3D</h2>

                        {/* Actions rapides */}
                        <div className="flex flex-col gap-1.5">
                            <button
                                type="button"
                                onClick={onOpenPlanetConfig}
                                className="w-full px-3 py-2 rounded-lg bg-purple-600/30 border border-purple-500/40 text-white text-xs font-medium hover:bg-purple-600/50 transition"
                            >
                                ⚙️ Configurer les Planètes
                            </button>
                            <ToggleBtn
                                label={opts.showOrbits ? "Masquer trajectoires" : "Afficher trajectoires"}
                                icon="👁"
                                active={opts.showOrbits}
                                onClick={() => opts.set("showOrbits", !opts.showOrbits)}
                            />
                            <ToggleBtn
                                label={opts.freezePlanets ? "Animer planètes" : "Figer planètes"}
                                icon={opts.freezePlanets ? "▶" : "⏸"}
                                active={opts.freezePlanets}
                                onClick={() => opts.set("freezePlanets", !opts.freezePlanets)}
                            />
                            <ToggleBtn
                                label={opts.enableVideoCycle ? "Vidéo en fondue" : "Vidéo en continue"}
                                icon="👁"
                                active={opts.enableVideoCycle}
                                onClick={() => opts.set("enableVideoCycle", !opts.enableVideoCycle)}
                            />
                            <ToggleBtn
                                label={opts.grayscaleVideo ? "Vidéo couleur" : "Vidéo N&B"}
                                icon="🎨"
                                active={opts.grayscaleVideo}
                                onClick={() => opts.set("grayscaleVideo", !opts.grayscaleVideo)}
                            />
                            <ToggleBtn
                                label={opts.showDebugInfo ? "Masquer debug" : "Afficher debug"}
                                icon="ℹ️"
                                active={opts.showDebugInfo}
                                onClick={() => opts.set("showDebugInfo", !opts.showDebugInfo)}
                            />
                        </div>

                        {/* Caméra */}
                        <Section title="Caméra & Espace">
                            <Slider
                                label="Échelle Planètes"
                                value={opts.globalPlanetScale}
                                min={0.1}
                                max={5.0}
                                step={0.1}
                                onChange={(v) => opts.set("globalPlanetScale", v)}
                            />
                            <Slider
                                label="Fish Eye (FOV)"
                                value={opts.fishEye}
                                min={30}
                                max={120}
                                step={1}
                                onChange={(v) => opts.set("fishEye", v)}
                            />
                            <Slider
                                label="Espacement Orbites"
                                value={opts.orbitSpacing}
                                min={0.5}
                                max={2.5}
                                step={0.1}
                                onChange={(v) => opts.set("orbitSpacing", v)}
                            />
                        </Section>

                        {/* Répartition Spatiale */}
                        <Section title="Répartition Spatiale">
                            <ToggleBtn
                                label={opts.autoDistributeOrbits ? "Désactiver Auto-Orbite" : "Répartir Auto Orbites"}
                                icon="🔄"
                                active={opts.autoDistributeOrbits}
                                onClick={() => opts.set("autoDistributeOrbits", !opts.autoDistributeOrbits)}
                            />
                            <div>
                                <p className="text-xs text-white/60 mb-1.5 mt-2">Mode Vertical (Y)</p>
                                <div className="grid grid-cols-3 gap-1">
                                    {(["manual", "homogeneous", "jupiter"] as const).map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`py-1.5 rounded-lg text-xs border transition ${opts.verticalMode === m
                                                ? "bg-purple-600/30 border-purple-500/50 text-white"
                                                : "bg-white/5 border-white/10 text-white/60 hover:text-white/80"
                                                }`}
                                            onClick={() => opts.set("verticalMode", m)}
                                        >
                                            {m === "manual" ? "Manuel" : m === "homogeneous" ? "Lissé" : "Jupiter"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Section>

                        {/* Vitesse de Survol */}
                        <Section title="Vitesse de Survol (Hover)">
                            <Slider
                                label="Multiplicateur Zone Orbite"
                                value={opts.hoverOrbitSpeedRatio}
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                onChange={(v) => opts.set("hoverOrbitSpeedRatio", v)}
                            />
                            <Slider
                                label="Multiplicateur Planète"
                                value={opts.hoverPlanetSpeedRatio}
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                onChange={(v) => opts.set("hoverPlanetSpeedRatio", v)}
                            />
                            <Slider
                                label="Vitesse Transition Orbite"
                                value={opts.hoverOrbitTransitionSpeed}
                                min={0.5}
                                max={10.0}
                                step={0.5}
                                onChange={(v) => opts.set("hoverOrbitTransitionSpeed", v)}
                            />
                            <Slider
                                label="Vitesse Transition Planète"
                                value={opts.hoverPlanetTransitionSpeed}
                                min={1.0}
                                max={20.0}
                                step={1.0}
                                onChange={(v) => opts.set("hoverPlanetTransitionSpeed", v)}
                            />
                        </Section>

                        {/* Orbites */}
                        <Section title="Forme des Orbites">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className={`flex-1 py-1.5 rounded-lg text-xs border transition ${!opts.globalShapeOverride
                                        ? "bg-purple-600/30 border-purple-500/50 text-white"
                                        : "bg-white/5 border-white/10 text-white/60"
                                        }`}
                                    onClick={() => opts.set("globalShapeOverride", false)}
                                >
                                    Par planète
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 py-1.5 rounded-lg text-xs border transition ${opts.globalShapeOverride
                                        ? "bg-purple-600/30 border-purple-500/50 text-white"
                                        : "bg-white/5 border-white/10 text-white/60"
                                        }`}
                                    onClick={() => opts.set("globalShapeOverride", true)}
                                >
                                    Forcer Forme
                                </button>
                            </div>
                            {opts.globalShapeOverride && (
                                <>
                                    <div className="flex gap-2">
                                        {(["circle", "squircle"] as const).map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                className={`flex-1 py-1.5 rounded-lg text-xs border transition ${opts.orbitShape === s
                                                    ? "bg-purple-600/30 border-purple-500/50 text-white"
                                                    : "bg-white/5 border-white/10 text-white/60"
                                                    }`}
                                                onClick={() => opts.set("orbitShape", s)}
                                            >
                                                {s === "circle" ? "Cercle" : "Squircle"}
                                            </button>
                                        ))}
                                    </div>
                                    {opts.orbitShape === "squircle" && (
                                        <Slider
                                            label="Arrondi"
                                            value={opts.orbitRoundness}
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            onChange={(v) => opts.set("orbitRoundness", v)}
                                        />
                                    )}
                                </>
                            )}
                        </Section>

                        {/* ─── Phase Entrée ─── */}
                        <Section title="⬇ Phase d'Entrée — Cinématique">
                            <Slider
                                label="Vitesse début entrée (u/s)"
                                value={opts.entrySpeedStart}
                                min={0}
                                max={10}
                                step={0.1}
                                onChange={(v) => opts.set("entrySpeedStart", v)}
                            />
                            <Slider
                                label="Vitesse fin entrée (u/s)"
                                value={opts.entrySpeedEnd}
                                min={0}
                                max={10}
                                step={0.1}
                                onChange={(v) => opts.set("entrySpeedEnd", v)}
                            />
                            <div>
                                <p className="text-xs text-white/60 mb-1.5">Type de rampe</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {(["linear", "easeIn", "easeOut", "easeInOut"] as const).map((e) => (
                                        <button
                                            key={e}
                                            type="button"
                                            className={`py-1.5 rounded-lg text-xs border transition ${opts.entryEasing === e
                                                ? "bg-indigo-600/40 border-indigo-500/40 text-white"
                                                : "bg-white/5 border-white/10 text-white/60 hover:text-white/80"
                                                }`}
                                            onClick={() => opts.set("entryEasing", e)}
                                        >
                                            {e === "linear" ? "Linéaire" : e === "easeIn" ? "Accél." : e === "easeOut" ? "Décél." : "S (In/Out)"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Slider
                                label="Durée entrée (s, 0=auto)"
                                value={opts.entryDuration}
                                min={0}
                                max={30}
                                step={0.5}
                                onChange={(v) => opts.set("entryDuration", v)}
                            />
                        </Section>

                        {/* ─── Phase Orbite ─── */}
                        <Section title="🪐 Phase Orbitale — Cinématique">
                            <Slider
                                label="Vitesse départ orbite (u/s)"
                                value={opts.orbitSpeedStart}
                                min={0}
                                max={10}
                                step={0.1}
                                onChange={(v) => opts.set("orbitSpeedStart", v)}
                            />
                            <Slider
                                label="Vitesse cible orbite (u/s)"
                                value={opts.orbitSpeedTarget}
                                min={0}
                                max={10}
                                step={0.1}
                                onChange={(v) => {
                                    opts.set("orbitSpeedTarget", v);
                                    opts.set("globalOrbitSpeed", v);
                                }}
                            />
                            <div>
                                <p className="text-xs text-white/60 mb-1.5">Type de rampe orbitale</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {(["linear", "easeIn", "easeOut", "easeInOut"] as const).map((e) => (
                                        <button
                                            key={e}
                                            type="button"
                                            className={`py-1.5 rounded-lg text-xs border transition ${opts.orbitEasing === e
                                                ? "bg-violet-600/40 border-violet-500/40 text-white"
                                                : "bg-white/5 border-white/10 text-white/60 hover:text-white/80"
                                                }`}
                                            onClick={() => opts.set("orbitEasing", e)}
                                        >
                                            {e === "linear" ? "Linéaire" : e === "easeIn" ? "Accél." : e === "easeOut" ? "Décél." : "S (In/Out)"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Slider
                                label="Durée rampe orbitale (s)"
                                value={opts.orbitalRampDuration}
                                min={0}
                                max={30}
                                step={1}
                                onChange={(v) => opts.set("orbitalRampDuration", v)}
                            />
                        </Section>


                        {/* Physique */}
                        <Section title="Physique">
                            <Slider
                                label="Force Souris"
                                value={opts.mouseForce}
                                min={0}
                                max={2}
                                step={0.05}
                                onChange={(v) => opts.set("mouseForce", v)}
                            />
                            <Slider
                                label="Force Collision"
                                value={opts.collisionForce}
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={(v) => opts.set("collisionForce", v)}
                            />
                            <Slider
                                label="Amortissement"
                                value={opts.damping}
                                min={0.8}
                                max={0.99}
                                step={0.01}
                                onChange={(v) => opts.set("damping", v)}
                            />
                            <Slider
                                label="Force Retour"
                                value={opts.returnForce}
                                min={0}
                                max={0.2}
                                step={0.005}
                                onChange={(v) => opts.set("returnForce", v)}
                            />
                        </Section>

                        {/* Animation d'entrée */}
                        <Section title="Animation d'Entrée">
                            <ToggleBtn
                                label={opts.showEntryTrajectory ? "Masquer trajectoires arrivée" : "Afficher trajectoires arrivée"}
                                icon="🞣"
                                active={opts.showEntryTrajectory}
                                onClick={() => opts.set("showEntryTrajectory", !opts.showEntryTrajectory)}
                            />
                            {/* Sélecteur de trajectoire */}
                            <div>
                                <p className="text-xs text-white/60 mb-1.5">Trajectoire d'arrivée</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {([
                                        ["linear", "→ Droite"],
                                        ["arc", "⌒ Arc"],
                                        ["ellipse", "⊙ Ellipse"],
                                        ["scurve", "∿ Courbe S"],
                                        ["wave", "〰 Vague"],
                                        ["spiral", "🌀 Spirale"],
                                        ["corkscrew", "⍁ Tire-bouchon"],
                                        ["fan", "🎇 Éventail"],
                                    ] as const).map(([val, lbl]) => (
                                        <button
                                            key={val}
                                            type="button"
                                            className={`py-1.5 rounded-lg text-xs border transition text-left px-2 ${opts.entryTrajectory === val
                                                ? "bg-indigo-600/40 border-indigo-500/40 text-white"
                                                : "bg-white/5 border-white/10 text-white/60 hover:text-white/80"
                                                }`}
                                            onClick={() => opts.set("entryTrajectory", val)}
                                        >
                                            {lbl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Slider distance éventail — affiché uniquement en mode fan */}
                            {opts.entryTrajectory === "fan" && (
                                <Slider
                                    label="Distance éventail (u)"
                                    value={opts.fanDistance}
                                    min={5}
                                    max={80}
                                    step={1}
                                    onChange={(v) => opts.set("fanDistance", v)}
                                />
                            )}
                            <Slider
                                label="Position X départ"
                                value={opts.entryStartX}
                                min={-100}
                                max={0}
                                step={1}
                                onChange={(v) => opts.set("entryStartX", v)}
                            />
                            <Slider
                                label="Position Y départ"
                                value={opts.entryStartY}
                                min={-20}
                                max={20}
                                step={0.5}
                                onChange={(v) => opts.set("entryStartY", v)}
                            />
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>Position Z (Auto)</span>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={opts.entryStartZ !== null}
                                            onChange={(e) =>
                                                opts.set("entryStartZ", e.target.checked ? 10 : null)
                                            }
                                            className="w-3 h-3 accent-purple-500"
                                        />
                                        <span>Manuel</span>
                                    </label>
                                </div>
                                {opts.entryStartZ !== null && (
                                    <Slider
                                        label="Position Z départ"
                                        value={opts.entryStartZ}
                                        min={0}
                                        max={30}
                                        step={0.5}
                                        onChange={(v) => opts.set("entryStartZ", v)}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={opts.triggerRestart}
                                className="w-full py-2 rounded-lg bg-indigo-600/40 border border-indigo-500/40 text-white text-xs font-medium hover:bg-indigo-600/60 transition"
                            >
                                🔄 Rejouer l'Intro
                            </button>
                        </Section>

                        {/* Vidéo */}
                        <Section title="Superposition Vidéo">
                            <Slider
                                label="Durée visible (s)"
                                value={opts.videoCycleVisible}
                                min={0}
                                max={30}
                                step={1}
                                onChange={(v) => opts.set("videoCycleVisible", v)}
                            />
                            <Slider
                                label="Durée cachée (s)"
                                value={opts.videoCycleHidden}
                                min={0}
                                max={30}
                                step={1}
                                onChange={(v) => opts.set("videoCycleHidden", v)}
                            />
                            <Slider
                                label="Transition (s)"
                                value={opts.videoTransition / 1000}
                                min={0}
                                max={3}
                                step={0.1}
                                onChange={(v) => opts.set("videoTransition", v * 1000)}
                            />
                        </Section>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
