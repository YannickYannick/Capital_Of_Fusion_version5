"use client";

import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { GoAndDanceTicketsEmbed } from "@/components/features/festival/GoAndDanceTicketsEmbed";

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  initialValue: string;
  emptyText: string;
}

export function FestivalBookYourHotelClient({
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
        field="festival_book_your_hotel_markdown"
        emptyText={emptyText}
      />

      {/* Billetterie Go&dance pleine largeur sous le contenu */}
      <div className="mt-16">
        <GoAndDanceTicketsEmbed />
        <p className="mt-4 text-center text-xs text-white/40">
          Powered by{" "}
          <a
            href="https://www.goandance.com"
            className="underline decoration-dotted text-white/70 hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            go&amp;dance
          </a>
        </p>
      </div>
    </div>
  );
}

