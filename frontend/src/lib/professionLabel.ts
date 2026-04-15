import type { DanceProfessionApi } from "@/types/user";

/** Libellé affiché pour une profession (fallback si `name` vide en base). */
export function formatProfessionChipLabel(p: Pick<DanceProfessionApi, "name" | "slug">): string {
  const n = (p.name ?? "").trim();
  if (n) return n;
  const s = (p.slug ?? "").trim();
  if (!s) return "—";
  return s
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
