import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Événements",
  description:
    "Calendrier des événements : festivals, soirées et ateliers bachata. Capital of Fusion.",
};

export default function EvenementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
