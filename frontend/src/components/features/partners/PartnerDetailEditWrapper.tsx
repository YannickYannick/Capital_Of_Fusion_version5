"use client";

import { AdminEditButton } from "@/components/shared/AdminEditButton";

/** Bouton « Modifier » staff sur les fiches partenaires (événement / cours) rendues côté serveur. */
export function PartnerDetailEditWrapper({
  editUrl,
  children,
}: {
  editUrl: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <AdminEditButton editUrl={editUrl} position="fixed-below-nav" label="Modifier" />
      {children}
    </div>
  );
}
