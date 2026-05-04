/**
 * Layout 2D « orbite » pour le carrousel mobile Explore (ellipse + profondeur).
 * Angles en radians ; le point focal est à angle = π/2 (bas de l’ellipse à l’écran, y vers le bas).
 */

const TAU = Math.PI * 2;

/** Angle absolu de la place `slotIndex` quand le focus continu est `focusFloat` (fraction d’index). */
export function orbitAngleForSlot(slotIndex: number, focusFloat: number, total: number): number {
  if (total <= 0) return Math.PI / 2;
  const step = TAU / total;
  return Math.PI / 2 + (slotIndex - focusFloat) * step;
}

/** Profondeur normalisée : 1 = devant, -1 = derrière (pour z-index / scale / blur). */
export function orbitSinDepth(angle: number): number {
  return Math.sin(angle);
}

export function orbitScaleForDepth(sinDepth: number, minScale = 0.5): number {
  const t = (sinDepth + 1) / 2;
  return minScale + (1 - minScale) * t;
}

/** Flou léger côté arrière (px) — garder une valeur modeste pour la perf mobile. */
export function orbitBlurForDepth(sinDepth: number, maxBlur = 6): number {
  const t = (sinDepth + 1) / 2;
  return maxBlur * (1 - t);
}

export function orbitOpacityForDepth(sinDepth: number, minOpacity = 0.45): number {
  const t = (sinDepth + 1) / 2;
  return minOpacity + (1 - minOpacity) * t;
}

export function orbitZIndex(sinDepth: number): number {
  return Math.round(100 + (sinDepth + 1) * 40);
}

/** Normalise un index de carrousel sur [0, total). */
export function orbitModIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((Math.round(index) % total) + total) % total;
}
