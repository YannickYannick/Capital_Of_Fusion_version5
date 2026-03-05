import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistBySlug } from "@/lib/api";

export default async function ArtistProfilePage({ params }: { params: { slug: string } }) {
    let artist;
    try { artist = await getArtistBySlug(params.slug); } catch (error) { notFound(); }
    const photoUrl = artist.photo || "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&auto=format&fit=crop";

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/artistes/annuaire" className="text-purple-400 hover:text-purple-300 text-sm font-semibold mb-8 inline-block">← Retour</Link>
                <div className="bg-surface-dark border border-white/10 rounded-3xl overflow-hidden mb-12 flex flex-col md:flex-row">
                    <div className="relative w-full md:w-1/3 h-[400px] md:h-auto"><Image src={photoUrl} alt={artist.name} fill className="object-cover" priority /></div>
                    <div className="p-8 md:p-12 flex-1">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{artist.name}</h1>
                        <div className="flex flex-wrap gap-2">{artist.styles?.map((s: any) => (<span key={s.slug || s} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">{s.name || s}</span>))}</div>
                    </div>
                </div>
                <div className="max-w-3xl"><h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">Biographie</h2><div className="text-white/70 leading-relaxed whitespace-pre-wrap">{artist.bio || "Aucune bio."}</div></div>
            </div>
        </div>
    );
}
