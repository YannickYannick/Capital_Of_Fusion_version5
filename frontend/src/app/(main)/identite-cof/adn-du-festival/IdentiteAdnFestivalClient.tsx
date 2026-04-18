"use client";

import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  initialValue: string;
  emptyText: string;
}

/** Même gabarit que Book your hôtel (markdown éditable config), sans bloc billetterie. */
export function IdentiteAdnFestivalClient({
  eyebrow,
  title,
  subtitle,
  initialValue,
  emptyText,
}: Props) {
  return (
    <div className="text-white">
      <EditableConfigMarkdownPage
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        initialValue={initialValue}
        field="identite_adn_festival_markdown"
        emptyText={emptyText}
      />
    </div>
  );
}
