/** Billetterie festival Paris Bachata Vibe — CTA ROOT / Book your pass (overlay Explore). */
export const PARIS_BACHATA_GOANDANCE_EVENT_URL =
  "https://www.goandance.com/en/event/8924/paris-bachata-vibe-festival-2026?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnprgCFDBKaBIcXNxli3o4eSeZW2PkudBsk3Noz0zPCH1myeSa1TemsZFcRKo_aem_IPghO3-MUFniUMOa5ucZUg";

export function organizationNodePageHref(slug: string): string {
  return `/organisation/noeuds/${encodeURIComponent(slug)}`;
}
