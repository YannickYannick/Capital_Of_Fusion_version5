/**
 * Couleurs niveaux workshops — alignées affiches officielles PBVF.
 * Open = vert · Beginner = orange · Intermediate = rose · Advanced = violet.
 */
export const LEVEL_COLORS = {
  open: '#3FAF6A',
  beginner: '#E0A030',
  intermediate: '#C43A7A',
  advanced: '#8B45C4',
} as const;

export type WorkshopLevel = keyof typeof LEVEL_COLORS;

export const LEVEL_LEGEND: { id: WorkshopLevel; label: string; color: string }[] = [
  { id: 'open', label: 'Open Level', color: LEVEL_COLORS.open },
  { id: 'beginner', label: 'Beginner', color: LEVEL_COLORS.beginner },
  { id: 'intermediate', label: 'Intermediate', color: LEVEL_COLORS.intermediate },
  { id: 'advanced', label: 'Advanced', color: LEVEL_COLORS.advanced },
];

/**
 * Retourne la couleur d’un niveau API, ou null si hors workshop / inconnu.
 */
export function colorForLevel(level?: string | null): string | null {
  if (!level) return null;
  const key = level.toLowerCase() as WorkshopLevel;
  return LEVEL_COLORS[key] ?? null;
}
