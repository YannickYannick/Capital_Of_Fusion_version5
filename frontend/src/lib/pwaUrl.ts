/**
 * URL publique de la PWA festival (Expo web).
 * Prod : https://app.capitaloffusion.com (DNS → projet Vercel `mobile/`).
 * Override : NEXT_PUBLIC_PWA_URL
 */
export function getPwaUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PWA_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://app.capitaloffusion.com";
}
