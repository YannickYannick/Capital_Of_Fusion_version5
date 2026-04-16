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

      {/* Billetterie Go&dance (snippet officiel injecté par GoAndDanceTicketsEmbed) */}
      <div className="mt-16">
        <GoAndDanceTicketsEmbed />
      </div>
    </div>
  );
}

