"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const FESTIVAL_DATE = new Date("2026-09-17T18:00:00");

function getTimeLeft() {
  const diff = FESTIVAL_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export default function FestivalCountdown() {
  const t = useTranslations("landing.countdown");
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  const units = [
    { value: timeLeft.days, label: t("days") },
    { value: timeLeft.hours, label: t("hours") },
    { value: timeLeft.minutes, label: t("minutes") },
    { value: timeLeft.seconds, label: t("seconds") },
  ];

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-xs uppercase tracking-widest text-[#f3ac41]/80">
        {t("label")}
      </p>
      <div className="flex gap-3 sm:gap-5">
        {units.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50 mt-1">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
