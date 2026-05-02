import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { TopLoadingBar } from "@/components/shared/TopLoadingBar";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const urbane = localFont({
  src: [
    { path: "../fonts/urbane/Urbane-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/urbane/Urbane-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/urbane/Urbane-DemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/urbane/Urbane-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/urbane/Urbane-Heavy.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-urbane",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capitaloffusion.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Capital of Fusion",
    template: "%s — Capital of Fusion",
  },
  description:
    "Bachata, cours et événements. Découvrez notre école et l'expérience Explore 3D.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Capital of Fusion",
    title: "Capital of Fusion",
    description: "Bachata, cours et événements. Découvrez notre école et l'expérience Explore 3D.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capital of Fusion",
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
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${urbane.className} ${urbane.variable} ${inter.variable}`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TopLoadingBar />
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
