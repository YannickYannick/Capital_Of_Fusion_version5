import Image from "next/image";
import Link from "next/link";
import { ArtistApi } from "@/types/user";

export default function ArtistCard({ artist }: { artist: ArtistApi }) {
    const photoUrl = artist.profile_picture || "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop";
    const fullName = `${artist.first_name || ""} ${artist.last_name || ""}`.trim() || artist.username;

    return (
        <Link href={`/artistes/profils/${artist.username}`} className="group bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 block">
            <div className="relative aspect-[4/5]">
                <Image
                    src={photoUrl}
                    alt={fullName}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors uppercase italic tracking-tighter">
                        {fullName}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {artist.professions.slice(0, 2).map(p => (
                            <span key={p.id} className="text-[10px] text-purple-400/80 font-black uppercase tracking-widest">{p.name}</span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}
