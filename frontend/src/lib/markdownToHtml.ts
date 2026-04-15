/**
 * Conversion Markdown → HTML sécurisée (sanitization XSS).
 * Utilisée pour afficher le contenu Notre vision, dernières informations, projets, etc. en blocs HTML.
 */
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Convertit une chaîne Markdown en HTML sanitized, prête pour dangerouslySetInnerHTML.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) return "";
  const rawHtml = marked(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "hr", "table", "thead", "tbody", "tr", "th", "td", "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "loading", "width", "height"],
  });
}
