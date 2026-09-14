"use client";

import Image from "next/image";
import { useState } from "react";
import {
  JACK_N_JILL_JUDGE_PANELS,
  type JackNJillLocale,
} from "@/data/festivalJackNJillFallback";

type TabId = "infos" | "juges";

type FestivalJackNJillTabsProps = {
  locale: string;
  infosLabel: string;
  judgesLabel: string;
  judgesIntro: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  infos: React.ReactNode;
};

/**
 * Onglets Infos / Juges — page Jack N Jill (site web).
 */
export function FestivalJackNJillTabs({
  locale,
  infosLabel,
  judgesLabel,
  judgesIntro,
  eyebrow,
  title,
  subtitle,
  infos,
}: FestivalJackNJillTabsProps) {
  const [tab, setTab] = useState<TabId>("infos");
  const loc: JackNJillLocale =
    locale === "fr" || locale === "en" || locale === "es" ? locale : "en";

  return (
    <div className="w-full text-white">
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Jack N Jill">
        <TabButton id="infos" label={infosLabel} active={tab === "infos"} onSelect={setTab} />
        <TabButton id="juges" label={judgesLabel} active={tab === "juges"} onSelect={setTab} />
      </div>

      {tab === "infos" ? (
        <div role="tabpanel">{infos}</div>
      ) : (
        <div role="tabpanel" className="space-y-10">
          <div className="rounded-2xl border border-white/15 bg-black/60 backdrop-blur-md px-5 py-7 md:px-9 md:py-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
            <p className="text-xs uppercase tracking-widest text-purple-200">{eyebrow}</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-4 text-white/85 max-w-3xl">{subtitle}</p>
            <p className="mt-4 text-white/70">{judgesIntro}</p>
          </div>

          {JACK_N_JILL_JUDGE_PANELS.map((panel) => (
            <section key={panel.id} className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {panel.title[loc]}
              </h2>
              <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <Image
                  src={panel.imageSrc}
                  alt={panel.title[loc]}
                  width={900}
                  height={1250}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              </div>
              <ul className="flex flex-wrap gap-x-3 gap-y-2">
                {panel.judges.map((name) => (
                  <li
                    key={name}
                    className="rounded-lg bg-[#f3ac41]/12 px-3 py-1.5 text-sm font-medium text-[#f3ac41]"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  id,
  label,
  active,
  onSelect,
}: {
  id: TabId;
  label: string;
  active: boolean;
  onSelect: (id: TabId) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(id)}
      className={
        active
          ? "rounded-lg bg-[#f3ac41] px-4 py-2 text-sm font-semibold text-[#1a0f05]"
          : "rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
      }
    >
      {label}
    </button>
  );
}
