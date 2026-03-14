/**
 * Page Identité COF — Dernières informations (liste chronologique).
 * En mode staff/admin : bouton Créer + lien Modifier par information, et affichage des brouillons.
 */
import { BulletinsListClient } from "./BulletinsListClient";

export const metadata = {
  title: "Dernières informations | Identité COF",
  description: "Dernières informations de Capital of Fusion.",
};

export default function BulletinsPage() {
  return <BulletinsListClient />;
}
