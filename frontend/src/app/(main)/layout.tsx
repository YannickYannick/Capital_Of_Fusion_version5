import { Navbar } from "@/components/shared/Navbar";

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
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
    </>
  );
}
