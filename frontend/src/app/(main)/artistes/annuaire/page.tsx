import { redirect } from "next/navigation";

/** Ancienne URL « annuaire » : même contenu que `/artistes` (filtres + grille). */
export default function AnnuaireRedirectPage() {
  redirect("/artistes");
}
