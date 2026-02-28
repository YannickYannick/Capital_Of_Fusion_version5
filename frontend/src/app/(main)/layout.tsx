import { Navbar } from "@/components/shared/Navbar";
import { PlanetsOptionsProvider } from "@/contexts/PlanetsOptionsContext";
import { GlobalVideoBackground } from "@/components/features/explore/canvas/ExploreVideos";
import { getSiteConfig } from "@/lib/api";

/**
 * Layout (main) — partagé par toutes les pages publiques.
 * Landing, Explore, Cours, Événements, Boutique, Organisation, Login.
 * Navbar fixe, vidéo fond possible sur landing.
 */
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig().catch(() => null);
  return (
    <PlanetsOptionsProvider>
      <Navbar />
      <GlobalVideoBackground config={config} />
      <main className="pt-16">{children}</main>
    </PlanetsOptionsProvider>
  );
}
