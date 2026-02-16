import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Découvrez les pôles et acteurs Capital of Fusion en 3D. Navigation immersive.",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
