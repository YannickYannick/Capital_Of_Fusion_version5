import { getArtists } from "@/lib/api";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api";

export const metadata = {
  title: "Nos Artistes | BachataVibe",
  description: "Découvrez nos professeurs, DJs et partenaires passionnés.",
};

export default async function ArtistesPage() {
  const artists = await getArtists();
  const baseUrl = getApiBaseUrl();

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
            Nos Artistes & Partenaires
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Rencontrez les passionnés qui font vibrer la communauté Capital of Fusion.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artistes/${artist.username}`}
              className="group block"
            >
              <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 hover:border-purple-500/30 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] flex flex-col">
                {/* Image / Avatar */}
                <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                  {artist.profile_picture ? (
                    <img
                      src={artist.profile_picture.startsWith('http') ? artist.profile_picture : `${baseUrl}${artist.profile_picture}`}
                      alt={`${artist.first_name} ${artist.last_name}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
                      👤
                    </div>
                  )}
                  {artist.is_vibe && (
                    <div className="absolute top-4 right-4 bg-purple-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-purple-400/30">
                      Vibe Member
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {artist.professions.map((p) => (
                      <span
                        key={p.id}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                    {artist.first_name} {artist.last_name}
                  </h3>

                  <p className="text-sm text-white/50 line-clamp-3 mb-4">
                    {artist.bio || "Aucune biographie disponible."}
                  </p>

                  <div className="mt-auto">
                    {artist.dance_level && (
                      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: artist.dance_level.color || '#fff' }}
                        />
                        <span className="text-xs font-medium text-white/40">
                          Niveau {artist.dance_level.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <span className="text-purple-400">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {artists.length === 0 && (
          <div className="py-20 text-center text-white/40">
            <p className="text-xl">Aucun artiste trouvé pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
