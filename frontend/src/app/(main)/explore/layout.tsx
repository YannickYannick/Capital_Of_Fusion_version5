import type { Metadata } from "next";

export const metadata: Metadata = {
  // `absolute` : évite le suffixe « — Capital of Fusion » du template racine.
  title: { absolute: "Festival PBVF Paris" },
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
