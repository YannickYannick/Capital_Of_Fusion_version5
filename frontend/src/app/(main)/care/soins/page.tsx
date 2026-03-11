import Link from "next/link";
import { getCareServices, getServiceCategories } from "@/lib/api";
import type { CareServiceApi, ServiceCategoryApi } from "@/types/care";

export const revalidate = 60;

export default async function SoinsPage() {
  const [services, categories] = await Promise.all([
    getCareServices().catch(() => [] as CareServiceApi[]),
    getServiceCategories().catch(() => [] as ServiceCategoryApi[]),
  ]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/care" className="hover:text-white transition">Care</Link>
          <span>/</span>
          <span className="text-white">Soins</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Espace bien-être
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Soins &{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Récupération
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Des soins adaptés aux danseurs pour prévenir les blessures et optimiser votre récupération.
          </p>
        </div>

        {/* Catégories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/care/soins?category=${cat.slug}`}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 text-white/80 text-sm font-medium transition"
                >
                  {cat.icon && <span className="mr-2">{cat.icon}</span>}
                  {cat.name}
                  <span className="ml-2 text-white/40">({cat.services_count})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Liste des soins */}
        {services.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">✨</p>
            <p className="text-white/60">Les soins seront bientôt disponibles.</p>
            <Link
              href="/care"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Retour au Care
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image */}
                {service.image && (
                  <div className="aspect-video relative bg-black/20 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Contenu */}
                <div className="p-6">
                  {service.category_name && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
                      {service.category_name}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-white/50 text-sm mt-1">
                    par {service.practitioner_name}
                  </p>
                  {service.short_description && (
                    <p className="text-white/60 text-sm mt-3 line-clamp-2">
                      {service.short_description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <span className="text-white/60 text-sm">
                        ⏱ {service.duration_minutes} min
                      </span>
                      <span className="text-lg font-bold text-white">
                        {service.price}€
                      </span>
                    </div>
                    <Link
                      href={`/care/praticiens/${service.practitioner_slug}`}
                      className="text-purple-400 text-sm font-medium hover:underline"
                    >
                      Voir le praticien
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
