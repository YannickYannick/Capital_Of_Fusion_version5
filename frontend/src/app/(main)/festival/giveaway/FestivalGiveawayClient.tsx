"use client";

const proseGiveaway =
  "mt-10 leading-relaxed text-white/95 [&_p]:text-white/95 [&_li]:text-white/95 " +
  "[&_a]:text-purple-300 [&_a]:font-medium [&_a:hover]:underline [&_a:hover]:text-purple-200 " +
  "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl md:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] " +
  "[&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_hr]:my-8 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-white/35 [&_hr]:to-transparent";

export interface FestivalGiveawayClientProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  instagramCta: string;
  instagramHref: string;
  bodyHtml: string;
}

export function FestivalGiveawayClient({
  eyebrow,
  title,
  subtitle,
  instagramCta,
  instagramHref,
  bodyHtml,
}: FestivalGiveawayClientProps) {
  return (
    <div className="text-white">
      <div
        className={[
          "rounded-2xl border border-white/15",
          "bg-black/65 backdrop-blur-md",
          "shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10",
          "px-5 py-8 md:px-9 md:py-10",
        ].join(" ")}
      >
        <p className="text-xs uppercase tracking-widest text-purple-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
          {title}
        </h1>
        <p className="mt-4 text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)] max-w-3xl">{subtitle}</p>

        <div className="mt-8">
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#f3ac41] bg-[#f3ac41] px-8 py-4 text-center text-lg font-black uppercase tracking-wider text-black shadow-[0_10px_40px_rgba(243,172,65,0.35)] hover:brightness-110 transition sm:flex-row sm:gap-2 sm:w-auto min-w-[min(100%,280px)]"
          >
            <span aria-hidden>📸</span>
            <span>{instagramCta}</span>
          </a>
        </div>

        {bodyHtml ? (
          <div className={proseGiveaway} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        ) : null}
      </div>
    </div>
  );
}
