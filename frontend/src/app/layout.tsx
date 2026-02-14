import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Capital of Fusion — École Nationale de Danse",
  description:
    "Bachata, cours et événements. Découvrez notre école et l'expérience Explore 3D.",
};

/**
 * Layout racine — 1 layout partagé pour toutes les pages (main).
 * Vidéos fond : YouTube (embeds).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
