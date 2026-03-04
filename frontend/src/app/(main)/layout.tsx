import { Navbar } from "@/components/shared/Navbar";
import { PlanetsOptionsProvider } from "@/contexts/PlanetsOptionsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { VideoBackgroundClient } from "@/components/features/explore/canvas/VideoBackgroundClient";
import { getSiteConfig } from "@/lib/api";

/**
 * Layout (main) — partagé par toutes les pages publiques.
 * Landing, Explore, Cours, Événements, Boutique, Organisation, Login, Dashboard.
 * Navbar fixe, vidéo fond possible sur landing.
 */
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig().catch(() => null);
  return (
    <AuthProvider>
      <PlanetsOptionsProvider>
        <Navbar />
        <VideoBackgroundClient config={config} />
        <main className="pt-16">{children}</main>
      </PlanetsOptionsProvider>
    </AuthProvider>
  );
}
