import { getArtistByUsername, getApiBaseUrl } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    try {
        const artist = await getArtistByUsername(username);
        return {
            title: `${artist.first_name} ${artist.last_name} | BachataVibe`,
            description: artist.bio,
        };
    } catch {
        return { title: "Artiste introuvable" };
    }
}

export default async function ArtisteDetailPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const baseUrl = getApiBaseUrl();

    let artist;
    try {
        artist = await getArtistByUsername(username);
    } catch (err) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white">
            {/* Hero Section / Profile Header */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-[#0a0e27]/80 to-[#0a0e27]" />
                {artist.profile_picture && (
                    <img
                        src={artist.profile_picture.startsWith('http') ? artist.profile_picture : `${baseUrl}${artist.profile_picture}`}
                        className="w-full h-full object-cover opacity-30 blur-sm scale-110"
                        alt=""
                    />
                )}

                <div className="absolute inset-0 flex items-end">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                            {/* Profile Image */}
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-[#0a0e27] shadow-2xl relative overflow-hidden bg-white/5 backdrop-blur-md">
                                {artist.profile_picture ? (
                                    <img
                                        src={artist.profile_picture.startsWith('http') ? artist.profile_picture : `${baseUrl}${artist.profile_picture}`}
                                        alt={`${artist.first_name} ${artist.last_name}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">👤</div>
                                )}
                            </div>

                            {/* Identity Info */}
                            <div className="text-center md:text-left flex-grow">
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                    {artist.professions.map((p) => (
                                        <span
                                            key={p.id}
                                            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300"
                                        >
                                            {p.name}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tight">
                                    {artist.first_name} <span className="text-purple-400">{artist.last_name}</span>
                                </h1>
                                {artist.dance_level && (
                                    <p className="text-white/60 font-medium">
                                        Niveau {artist.dance_level.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Bio & Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-500 pl-4">Biographie</h2>
                            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 leading-relaxed text-white/80">
                                {artist.bio || "Aucune biographie détaillée n'a été saisie par cet artiste."}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-500 pl-4">Pôles d'activité</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                                    <h3 className="font-bold text-lg mb-2 text-purple-400">Cours & Enseignement</h3>
                                    <p className="text-sm text-white/60">Retrouvez les cours réguliers et les stages de {artist.first_name}.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                                    <h3 className="font-bold text-lg mb-2 text-purple-400">Booking & Événements</h3>
                                    <p className="text-sm text-white/60">Disponible pour des festivals, soirées et démonstrations privées.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Actions & Contact */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-1 rounded-3xl">
                            <div className="bg-[#0f1435] rounded-[22px] p-8">
                                <h3 className="text-xl font-bold mb-6 text-center">Contacter l'artiste</h3>
                                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl transition-all mb-4 shadow-lg shadow-purple-600/20">
                                    Envoyer un message
                                </button>
                                <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all">
                                    Voir le calendrier
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-white/40 mb-6">Suivre sur les réseaux</h4>
                            <div className="flex justify-around gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                                <div className="text-2xl">📸</div>
                                <div className="text-2xl">💃</div>
                                <div className="text-2xl">📺</div>
                                <div className="text-2xl">🌐</div>
                            </div>
                            <p className="text-[10px] text-center mt-6 text-white/30 italic">Liens sociaux à configurer dans le profil</p>
                        </div>

                        <Link href="/artistes" className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors text-sm py-4">
                            <span>← Retour à l'annuaire</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
