"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconBrandInstagram, IconWorld } from "@tabler/icons-react";
import { getArtistByUsername } from "@/lib/api";
import { profileLinksFromApi } from "@/types/profileLinks";
import type { ArtistApi } from "@/types/user";

function hrefWithProtocol(href: string): string {
  const h = href.trim();
  if (!h) return "#";
  return h.startsWith("http") ? h : `https://${h}`;
}

/**
 * Bandeau sous la navbar sur /artistes/profils/[username] : structures partenaires, Instagram, sites web.
 */
export function ArtistProfileNavbarDock() {
  const pathname = usePathname() ?? "";
  const t = useTranslations("artistPublic");
  const match = pathname.match(/^\/artistes\/profils\/([^/]+)\/?$/);
  const rawUsername = match?.[1];
  const username = rawUsername ? decodeURIComponent(rawUsername) : null;

  const [artist, setArtist] = useState<ArtistApi | null>(null);

  useEffect(() => {
    if (!username) {
      setArtist(null);
      return;
    }
    let cancelled = false;
    getArtistByUsername(username)
      .then((a) => {
        if (!cancelled) setArtist(a);
      })
      .catch(() => {
        if (!cancelled) setArtist(null);
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!artist) return null;

  const merged = profileLinksFromApi(artist.external_links);
  const ig = merged.instagram.filter(Boolean);
  const ws = merged.websites.filter(Boolean);
  const structs = artist.linked_partner_structures ?? [];

  if (structs.length === 0 && ig.length === 0 && ws.length === 0) return null;

  return (
    <div
      className="border-t border-white/10 bg-black/80 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
      aria-label={t("dockAriaLabel")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] sm:text-xs">
        {structs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="uppercase tracking-[0.2em] text-white/40 font-bold shrink-0">
              {t("dockStructures")}
            </span>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {structs.map((s) => (
                <Link
                  key={s.slug}
                  href={`/partenaires/structures/${encodeURIComponent(s.slug)}`}
                  className="inline-flex items-center rounded-full border border-purple-500/35 bg-purple-500/15 px-2.5 py-1 font-semibold text-purple-200 hover:bg-purple-500/25 hover:text-white transition-colors truncate max-w-[14rem]"
                  title={s.name}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {(ig.length > 0 || ws.length > 0) && (
          <div
            className={`flex flex-wrap items-center gap-3 min-w-0 ${
              structs.length > 0 ? "border-l border-white/10 pl-4 sm:pl-5 ml-0 sm:ml-1" : ""
            }`}
          >
            {ig.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-[0.2em] text-white/40 font-bold shrink-0">
                  {t("dockInstagram")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ig.map((url, i) => (
                    <a
                      key={`ig-${i}`}
                      href={hrefWithProtocol(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/40 transition-colors"
                      aria-label={t("dockInstagramProfile", { n: i + 1 })}
                    >
                      <IconBrandInstagram size={18} stroke={1.5} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {ws.length > 0 && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="uppercase tracking-[0.2em] text-white/40 font-bold shrink-0">
                  {t("dockWebsites")}
                </span>
                <div className="flex flex-wrap gap-1.5 min-w-0">
                  {ws.map((url, i) => (
                    <a
                      key={`w-${i}`}
                      href={hrefWithProtocol(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-[10rem] sm:max-w-[14rem] items-center gap-1 truncate rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <IconWorld size={14} className="shrink-0 opacity-70" />
                      <span className="truncate">{t("dockWebsiteN", { n: i + 1 })}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
