# Feature : Organisation — Pôles & Staff

Section **Organisation** : **Pôles** (liste des équipes avec nombre de membres) et **Notre Staff** (liste des membres staff/admin, UX type page Artistes, filtre par pôle).

---

## Où c’est dans le code

| Rôle | Emplacement |
|------|-------------|
| Modèle Pôle | `backend/apps/organization/models.py` — `Pole` (name, slug, order) |
| Modèle User | `backend/apps/users/models.py` — champ `pole` (FK vers `organization.Pole`, optionnel, pour staff/admin) |
| Migrations | `organization/0003_add_pole_model.py`, `0004_populate_poles.py` (11 pôles initiaux), `users/0004_user_pole.py` |
| API pôles | `GET /api/organization/poles/` — liste avec `members_count` (annotate) |
| API staff | `GET /api/organization/staff/` — liste User STAFF/ADMIN ; `?pole=<slug>` pour filtrer par pôle |
| Serializers | `backend/apps/organization/serializers.py` — `PoleSerializer`, `StaffMemberSerializer` |
| Vues | `backend/apps/organization/views.py` — `PoleListAPIView`, `StaffListAPIView` |
| Frontend pages | `organisation/poles/page.tsx` (liste pôles + x membres), `organisation/staff/page.tsx` (grille staff, filtre pôles) |
| Composants | `StaffCard.tsx` (carte membre, style ArtistCard) |
| API client | `frontend/src/lib/api.ts` — getPoles(), getStaffMembers(poleSlug?) |
| Types | `frontend/src/types/organization.ts` — PoleApi, StaffMemberApi |

---

## Comportement

- **/organisation/poles** : titre « NOS PÔLES », liste des pôles avec « x membre(s) » (comptage automatique des User avec ce pole).
- **/organisation/staff** : titre « NOTRE STAFF », filtre par pôle (Tous + un bouton par pôle), grille de cartes (photo, nom, rôle, pôle) — même UX que /artistes.
- Le nombre de membres par pôle est calculé côté API (User avec `pole` = ce pôle).

---

## Configuration admin

- **Pôles** : Admin Django → Organization → Pôles (nom, slug, ordre). Les 11 pôles initiaux sont créés par la migration `0004_populate_poles`.
- **Rattachement staff** : Admin Django → Utilisateurs → édition d’un compte Staff ou Admin → champ **Pôle (Staff / Admin)**. Seuls les utilisateurs avec type STAFF ou ADMIN sont listés sur /organisation/staff et comptés dans les pôles.

---

*Voir aussi : [organisation-noeuds.md](organisation-noeuds.md) pour Structure et Nœuds, [03-api_docs.md](../bmad/03-api_docs.md) pour les endpoints.*
