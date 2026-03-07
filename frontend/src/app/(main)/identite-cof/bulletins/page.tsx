/**
 * Page Identité COF — Bulletins (liste chronologique).
 * En mode staff/admin : bouton Créer + lien Modifier par bulletin, et affichage des brouillons.
 */
import { BulletinsListClient } from "./BulletinsListClient";

export const metadata = {
  title: "Bulletins | Identité COF",
  description: "Bulletins d'information de Capital of Fusion.",
};

export default function BulletinsPage() {
  return <BulletinsListClient />;
}
