import Link from "next/link";
import { getProjects } from "@/lib/api";
import type { ProjectApi } from "@/types/projects";

export const revalidate = 60;

export default async function IncubationPage() {
  const projects = await getProjects({ status: "UPCOMING" }).catch(() => [] as ProjectApi[]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8 animate-in fade-in duration-500">
          <Link href="/projets" className="hover:text-white transition">Projets</Link>
          <span>/</span>
          <span className="text-white">Incubation</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Projets Capital of Fusion
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Projets en{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Incubation
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Les projets à venir, en phase de conception et de préparation.
          </p>
        </div>

        {/* Liste des projets */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl mb-4">🚀</p>
            <p className="text-white/60">Aucun projet en incubation pour le moment.</p>
            <Link
              href="/projets"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition"
            >
              Voir tous les projets
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: ProjectApi; index: number }) {
  return (
    <Link
      href={`/projets/${project.slug}`}
      className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      {project.cover_image && (
        <div className="aspect-video relative bg-black/20 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Contenu */}
      <div className="p-6">
        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
          À venir
        </span>
        <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
          {project.title}
        </h3>
        {project.summary && (
          <p className="text-white/60 text-sm mt-2 line-clamp-2">{project.summary}</p>
        )}
        {project.start_date && (
          <p className="text-white/40 text-sm mt-4">
            📅 Début prévu : {new Date(project.start_date).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </Link>
  );
}
