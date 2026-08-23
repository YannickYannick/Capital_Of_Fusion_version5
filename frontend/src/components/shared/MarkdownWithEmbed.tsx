"use client";

import { Fragment, type ReactNode } from "react";
import { markdownToHtml } from "@/lib/markdownToHtml";

/** Remplace un token texte du Markdown par un bloc React (ex. plan photo/vidéo). */
export type MarkdownEmbed = {
  token: string;
  node: ReactNode;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Rend un Markdown en découpant sur le token d'embed.
 * Inputs: markdown brut, classes prose du conteneur, embed optionnel.
 * Outputs: fragments HTML entrecoupés du noeud React ; le token n'apparaît
 * jamais tel quel, même sans embed fourni (il est alors retiré du texte).
 */
export function renderMarkdownWithEmbed(
  markdown: string,
  proseClassName: string,
  embed?: MarkdownEmbed,
): ReactNode {
  if (!markdown.trim()) return null;

  const token = embed?.token?.trim();
  const parts = token ? markdown.split(new RegExp(escapeRegExp(token), "g")) : [markdown];

  if (parts.length === 1) {
    return (
      <div
        className={proseClassName}
        dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
      />
    );
  }

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part.trim() ? (
            <div
              className={proseClassName}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(part) }}
            />
          ) : null}
          {index < parts.length - 1 ? embed?.node ?? null : null}
        </Fragment>
      ))}
    </>
  );
}
