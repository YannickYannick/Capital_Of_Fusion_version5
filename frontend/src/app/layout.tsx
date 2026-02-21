import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capitaloffusion.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Capital of Fusion — École Nationale de Danse",
    template: "%s — Capital of Fusion",
  },
  description:
    "Bachata, cours et événements. Découvrez notre école et l'expérience Explore 3D.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Capital of Fusion",
    title: "Capital of Fusion — École Nationale de Danse",
    description: "Bachata, cours et événements. Découvrez notre école et l'expérience Explore 3D.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capital of Fusion — École Nationale de Danse",
    description: "Bachata, cours et événements. Découvrez notre école et l'expérience Explore 3D.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
