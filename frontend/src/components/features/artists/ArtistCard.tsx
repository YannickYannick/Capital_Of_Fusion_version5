import Image from "next/image";
import Link from "next/link";
import { ArtistApi } from "@/types/user";

export function ArtistCard({ artist }: { artist: ArtistApi }) {
    const photoUrl = artist.photo || "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop";
    return (
        <Link href={`/artistes/profils/${artist.slug}`} className="group bg-surface-dark border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 block">
            <div className="relative aspect-[4/5]"><Image src={photoUrl} alt={artist.name} fill className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent" />
                <div className="absolute bottom-4 left-4"><h3 className="text-xl font-bold text-white group-hover:text-purple-400">{artist.name}</h3></div>
            </div>
        </Link>
    );
}
