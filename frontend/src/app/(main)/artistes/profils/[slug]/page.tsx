import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistBySlug } from "@/lib/api";

export default async function ArtistProfilePage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    let artist;
    try {
        artist = await getArtistBySlug(params.slug);
    } catch (error) {
        notFound();
    }

    const photoUrl = artist.profile_picture || "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&auto=format&fit=crop";
    const fullName = `${artist.first_name || ""} ${artist.last_name || ""}`.trim() || artist.username;

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/artistes" className="text-purple-400 hover:text-purple-300 text-sm font-semibold mb-8 inline-block">← Retour</Link>
                <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden mb-12 flex flex-col md:flex-row shadow-2xl">
                    <div className="relative w-full md:w-1/3 h-[400px] md:h-auto">
                        <Image src={photoUrl} alt={fullName} fill className="object-cover" priority unoptimized />
                    </div>
                    <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-tighter leading-none">{fullName}</h1>
                        <div className="flex flex-wrap gap-2">
                            {artist.professions?.map((p: any) => (
                                <span key={p.id} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest leading-none">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="max-w-3xl">
                    <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-6 border-b border-white/5 pb-4">Biographie</h2>
                    <div className="text-white/70 text-lg leading-relaxed font-light whitespace-pre-wrap">
                        {artist.bio || "Le portrait de cet artiste n'est pas encore complet."}
                    </div>
                </div>
            </div>
        </div>
    );
}
