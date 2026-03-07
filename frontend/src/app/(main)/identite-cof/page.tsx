import { redirect } from "next/navigation";

/**
 * Racine Identité COF — redirige vers Notre vision.
 */
export default function IdentiteCofPage() {
  redirect("/identite-cof/notre-vision");
}
