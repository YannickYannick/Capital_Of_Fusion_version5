/**
 * Corrige le mojibake UTF-8 lu comme Latin-1 (ex. « basÃ©s » → « basés »).
 * No-op si la chaîne est déjà correcte.
 */
export function fixMojibake(text: string): string {
  if (!text) return text;
  if (!/[ÃÂð]|â[€˜™]/.test(text)) return text;
  try {
    // latin1 bytes → utf8
    const bytes = Uint8Array.from(text, (c) => c.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (decoded.includes('\uFFFD')) return text;
    return decoded;
  } catch {
    return text;
  }
}
