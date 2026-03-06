import { getArtists } from "@/lib/api";
import ArtistCard from "@/components/features/artists/ArtistCard";

export default async function AnnuairePage() {
    let artists = [];
    try { artists = await getArtists(); } catch (error) { console.error(error); }

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">L'Annuaire</p>
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4">
                        Découvrez nos <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Talents</span>
                    </h1>
                </div>
                {artists.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl"><p className="text-white/60">Aucun artiste trouvé.</p></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {artists.map((artist) => (<ArtistCard key={artist.id} artist={artist} />))}
                    </div>
                )}
            </div>
        </div>
    );
}
