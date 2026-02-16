import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cours",
  description:
    "Catalogue des cours de bachata, salsa et kizomba. Filtrez par style et niveau. Capital of Fusion.",
};

export default function CoursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
