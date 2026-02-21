export default function SkeletonPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center animate-in fade-in duration-500">
        <h1 className="text-4xl font-bold text-white mb-6 uppercase tracking-wider">
          En construction
        </h1>
        <p className="text-lg text-white/70 max-w-2xl">
          Cours Filtres — Cette section sera disponible prochainement dans la Phase 2 du projet.
        </p>
      </div>
    </div>
  );
}
