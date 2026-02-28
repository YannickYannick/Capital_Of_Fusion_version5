"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface DebugPanelProps {
    /** ref retourné par useRef(null) pointant vers les OrbitControls */
    controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null>;
    /** ref sur la camera Three.js */
    cameraRef: React.RefObject<THREE.Camera | null>;
}

function CoordInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <label className="text-white/40 text-[10px]">{label}</label>
            <input
                type="number"
                step="0.1"
                value={value.toFixed(2)}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500/50"
            />
        </div>
    );
}

/**
 * DebugPanel (fixed top-24 left-8) — Outil développeur.
 * Affiche et permet de modifier la position caméra et la cible en temps réel.
 * Permet de définir une position de référence persistée en localStorage.
 */
export function DebugPanel({ controlsRef, cameraRef }: DebugPanelProps) {
    const [camPos, setCamPos] = useState({ x: 0, y: 6.84, z: 18.79 });
    const [camTarget, setCamTarget] = useState({ x: 0, y: 0, z: 0 });
    const [editPos, setEditPos] = useState({ x: 0, y: 6.84, z: 18.79 });
    const [editTarget, setEditTarget] = useState({ x: 0, y: 0, z: 0 });
    const [refPos, setRefPos] = useState({ x: 0, y: 6.84, z: 18.79 });
    const [refTarget, setRefTarget] = useState({ x: 0, y: 0, z: 0 });
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Charger la position de référence depuis localStorage
    useEffect(() => {
        setRefPos({
            x: parseFloat(localStorage.getItem("camera_ref_x") ?? "0"),
            y: parseFloat(localStorage.getItem("camera_ref_y") ?? "6.84"),
            z: parseFloat(localStorage.getItem("camera_ref_z") ?? "18.79"),
        });
        setRefTarget({
            x: parseFloat(localStorage.getItem("camera_ref_target_x") ?? "0"),
            y: parseFloat(localStorage.getItem("camera_ref_target_y") ?? "0"),
            z: parseFloat(localStorage.getItem("camera_ref_target_z") ?? "0"),
        });
    }, []);

    // Mise à jour des coords live
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const cam = cameraRef.current;
            const ctrl = controlsRef.current;
            if (cam) {
                const p = { x: cam.position.x, y: cam.position.y, z: cam.position.z };
                setCamPos(p);
                setEditPos(p);
            }
            if (ctrl) {
                const t = { x: ctrl.target.x, y: ctrl.target.y, z: ctrl.target.z };
                setCamTarget(t);
                setEditTarget(t);
            }
        }, 100);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [cameraRef, controlsRef]);

    const applyPosition = () => {
        const cam = cameraRef.current;
        if (cam) cam.position.set(editPos.x, editPos.y, editPos.z);
    };

    const applyTarget = () => {
        const ctrl = controlsRef.current;
        if (ctrl) {
            ctrl.target.set(editTarget.x, editTarget.y, editTarget.z);
            ctrl.update();
        }
    };

    const setAsReference = () => {
        const cam = cameraRef.current;
        const ctrl = controlsRef.current;
        if (!cam) return;
        localStorage.setItem("camera_ref_x", String(cam.position.x));
        localStorage.setItem("camera_ref_y", String(cam.position.y));
        localStorage.setItem("camera_ref_z", String(cam.position.z));
        if (ctrl) {
            localStorage.setItem("camera_ref_target_x", String(ctrl.target.x));
            localStorage.setItem("camera_ref_target_y", String(ctrl.target.y));
            localStorage.setItem("camera_ref_target_z", String(ctrl.target.z));
            setRefTarget({ x: ctrl.target.x, y: ctrl.target.y, z: ctrl.target.z });
        }
        setRefPos({ x: cam.position.x, y: cam.position.y, z: cam.position.z });
    };

    return (
        <aside className="fixed top-24 left-4 z-20 w-56 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl p-4 flex flex-col gap-4 font-mono text-xs">
            <h2 className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Debug Caméra</h2>

            {/* Position caméra */}
            <section>
                <p className="text-white/40 text-[10px] uppercase mb-2 flex items-center gap-1">📷 Position</p>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {(["x", "y", "z"] as const).map((axis) => (
                        <CoordInput
                            key={axis}
                            label={axis.toUpperCase()}
                            value={editPos[axis]}
                            onChange={(v) => setEditPos((p) => ({ ...p, [axis]: v }))}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={applyPosition}
                    className="w-full py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-white/80 text-[10px] transition"
                >
                    Appliquer Position
                </button>
            </section>

            {/* Cible */}
            <section>
                <p className="text-white/40 text-[10px] uppercase mb-2 flex items-center gap-1">🎯 Cible</p>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {(["x", "y", "z"] as const).map((axis) => (
                        <CoordInput
                            key={axis}
                            label={axis.toUpperCase()}
                            value={editTarget[axis]}
                            onChange={(v) => setEditTarget((p) => ({ ...p, [axis]: v }))}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={applyTarget}
                    className="w-full py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-white/80 text-[10px] transition"
                >
                    Appliquer Orientation
                </button>
            </section>

            {/* Centre scène */}
            <section>
                <p className="text-white/40 text-[10px] uppercase mb-1 flex items-center gap-1">🌍 Centre Scène</p>
                <p className="text-white/30 text-[10px]">0.00 / 0.00 / 0.00</p>
            </section>

            {/* Position de référence */}
            <section>
                <p className="text-white/40 text-[10px] uppercase mb-1 flex items-center gap-1">📍 Référence</p>
                <p className="text-white/30 text-[10px]">
                    {refPos.x.toFixed(2)} / {refPos.y.toFixed(2)} / {refPos.z.toFixed(2)}
                </p>
                <p className="text-white/20 text-[10px] mb-2">
                    → {refTarget.x.toFixed(2)} / {refTarget.y.toFixed(2)} / {refTarget.z.toFixed(2)}
                </p>
                <button
                    type="button"
                    onClick={setAsReference}
                    className="w-full py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-white/80 text-[10px] transition"
                >
                    Définir comme référence
                </button>
            </section>
        </aside>
    );
}
