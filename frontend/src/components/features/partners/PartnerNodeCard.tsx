"use client";

/**
 * Carte structure partenaire pour /partenaires/structures.
 * Même style que NodeCard, lien vers /partenaires/structures/[slug].
 */
import Image from "next/image";
import Link from "next/link";
import type { PartnerNodeApi } from "@/types/partner";
import { getApiBaseUrl } from "@/lib/api";

function nodeCoverUrl(node: PartnerNodeApi): string | null {
  const cover = node.cover_image;
  if (!cover) return null;
  if (cover.startsWith("http")) return cover;
  const base = getApiBaseUrl();
  return `${base}${cover.startsWith("/") ? "" : "/"}${cover}`;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop";

export function PartnerNodeCard({ node }: { node: PartnerNodeApi }) {
  const cover = nodeCoverUrl(node) || PLACEHOLDER_IMAGE;

  return (
    <Link
      href={`/partenaires/structures/${node.slug}`}
      className="group bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 block"
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={cover}
          alt={node.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={cover.startsWith("http") && !cover.includes(process.env.NEXT_PUBLIC_VERCEL_URL || "")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-600/80 text-white mb-2">
            Partenaire
          </span>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors uppercase italic tracking-tighter">
            {node.name}
          </h3>
          {node.short_description && (
            <p className="text-sm text-white/70 mt-1 line-clamp-2">{node.short_description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
