import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { ArtistApi } from "@/types/user";
import { AdminEditButton } from "@/components/shared/AdminEditButton";
import { getApiBaseUrl } from "@/lib/api";

function resolveArtistPhotoUrl(url: string | null | undefined): string {
    if (!url) return "/images/placeholder-artist.jpg";
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("http")) return url;
    const base = getApiBaseUrl().replace(/\/$/, "");
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

const ArtistCard = memo(function ArtistCard({ artist, priority = false }: { artist: ArtistApi; priority?: boolean }) {
    const photoUrl = resolveArtistPhotoUrl(artist.profile_picture);
    const fullName = `${artist.first_name || ""} ${artist.last_name || ""}`.trim() || artist.username;

    return (
        <div className="relative group">
            <AdminEditButton
                editUrl={`/artistes/${encodeURIComponent(artist.username)}/edit`}
                position="top-right"
                label="Éditer"
                size="sm"
            />
            <Link href={`/artistes/profils/${artist.username}`} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 block">
                <div className="relative aspect-[4/5]">
                    <Image
                        src={photoUrl}
                        alt={fullName}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        priority={priority}
                        unoptimized={
                            photoUrl.includes("localhost") ||
                            photoUrl.includes("127.0.0.1") ||
                            photoUrl.includes("res.cloudinary.com")
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors uppercase italic tracking-tighter">
                            {fullName}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {(artist.professions ?? []).slice(0, 2).map(p => (
                                <span key={p.id} className="text-[10px] text-purple-400/80 font-black uppercase tracking-widest">{p.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
});

export default ArtistCard;
