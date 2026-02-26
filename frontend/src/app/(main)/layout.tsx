import { Navbar } from "@/components/shared/Navbar";
import { PlanetsOptionsProvider } from "@/contexts/PlanetsOptionsContext";
import { GlobalVideoBackground } from "@/components/features/explore/ExploreVideos";

/**
 * Layout (main) — partagé par toutes les pages publiques.
 * Landing, Explore, Cours, Événements, Boutique, Organisation, Login.
 * Navbar fixe, vidéo fond possible sur landing.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanetsOptionsProvider>
      <Navbar />
      <GlobalVideoBackground />
      <main className="pt-16">{children}</main>
    </PlanetsOptionsProvider>
  );
}
