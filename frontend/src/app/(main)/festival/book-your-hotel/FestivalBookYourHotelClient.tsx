"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { GoAndDanceTicketsEmbed } from "@/components/features/festival/GoAndDanceTicketsEmbed";

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  initialValue: string;
  emptyText: string;
}

const HOTEL_SOCIALS = [
  { dayKey: "thu" as const, start: "14:00", end: "17:00" },
  { dayKey: "fri" as const, start: "13:00", end: "18:30" },
  { dayKey: "sat" as const, start: "13:30", end: "18:00" },
  { dayKey: "sun" as const, start: "15:00", end: "20:00" },
];

/**
 * Page Book your hotel — markdown + Hotel Day Socials + billetterie.
 */
export function FestivalBookYourHotelClient({
  eyebrow,
  title,
  subtitle,
  initialValue,
  emptyText,
}: Props) {
  const t = useTranslations("pages.festivalBookHotel");
  const locale = useLocale();

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

      <section className="mx-auto mt-12 w-full max-w-3xl px-4 sm:px-6" aria-labelledby="hotel-day-socials">
        <h2 id="hotel-day-socials" className="text-xl font-semibold tracking-wide text-[var(--brand)]">
          {t("socialsTitle")}
        </h2>
        <p className="mt-2 text-sm text-white/75">{t("socialsIntro")}</p>

        <div className="mt-6 overflow-hidden rounded-xl border border-white/15 bg-black/35">
          <div className="relative aspect-square w-full bg-black/40 sm:aspect-[4/3]">
            <Image
              src="/images/festival/hotel-day-socials.png"
              alt={t("socialsPosterAlt")}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              priority={false}
            />
          </div>
          <ul className="divide-y divide-white/10">
            {HOTEL_SOCIALS.map((row) => (
              <li
                key={row.dayKey}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm sm:px-5"
              >
                <span className="font-medium text-white">{t(`socialsDays.${row.dayKey}`)}</span>
                <span className="tabular-nums text-[var(--brand)]">
                  {row.start} – {row.end}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-xs text-white/50" lang={locale}>
          {t("socialsNote")}
        </p>
      </section>

      <div className="mt-16">
        <GoAndDanceTicketsEmbed />
      </div>
    </div>
  );
}
