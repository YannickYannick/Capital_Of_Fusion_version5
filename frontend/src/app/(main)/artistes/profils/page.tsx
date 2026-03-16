import Link from "next/link";
import { getArtists } from "@/lib/api";
import type { ArtistApi } from "@/types/user";

export const revalidate = 60;

export default async function ProfilsPage() {
  const artists = await getArtists().catch(() => [] as ArtistApi[]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/artistes" className="hover:text-white transition">Artistes</Link>
          <span>/</span>
          <span className="text-white">Profils</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Profils{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Artistes
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Découvrez les artistes de la communauté Capital of Fusion.
          </p>
        </div>

        {/* Liste des artistes */}
        {artists.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">🎤</p>
            <p className="text-white/60">Aucun profil artiste disponible pour le moment.</p>
            <Link
              href="/artistes"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Retour aux artistes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artists.map((artist, i) => (
              <Link
                key={artist.id}
                href={`/artistes/${artist.username}`}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Photo */}
                <div className="aspect-square relative bg-black/20 overflow-hidden">
                  {(artist.profile_image ?? artist.profile_picture) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(artist.profile_image ?? artist.profile_picture) ?? ""}
                      alt={(artist.display_name ?? `${(artist.first_name || "").trim()} ${(artist.last_name || "").trim()}`.trim()) || artist.username}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Infos */}
                <div className="p-4">
                  <h3 className="text-white font-bold group-hover:text-purple-400 transition-colors truncate">
                    {(artist.display_name ?? `${(artist.first_name || "").trim()} ${(artist.last_name || "").trim()}`.trim()) || artist.username}
                  </h3>
                  {artist.professions && artist.professions.length > 0 && (
                    <p className="text-white/50 text-sm mt-1 truncate">
                      {artist.professions.map(p => p.name).join(", ")}
                    </p>
                  )}
                  {artist.styles && artist.styles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {artist.styles.slice(0, 2).map(style => (
                        <span
                          key={style.id}
                          className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300"
                        >
                          {style.name}
                        </span>
                      ))}
                      {artist.styles.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
                          +{artist.styles.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
