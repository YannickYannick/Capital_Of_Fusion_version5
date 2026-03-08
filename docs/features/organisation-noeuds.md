# Feature : Organisation — Structure & Nœuds

Section **Organisation** : page d’accueil avec liens vers **Structure** (organigramme) et **Nœuds** (annuaire). Chaque nœud dispose d’une **fiche dédiée** avec cours et événements, style profil artiste.

---

## Où c’est dans le code

| Rôle | Emplacement |
|------|-------------|
| Modèle | `backend/apps/organization/models.py` — `OrganizationNode` (parent, name, slug, type, cover_image, short_description, content, etc.) |
| API | `GET /api/organization/nodes/` (liste 3D), `GET /api/organization/nodes/?for_structure=1` (tous les nœuds + `parent_slug`), `GET /api/organization/nodes/<slug>/` |
| API cours/events | `GET /api/courses/?node=<slug>`, `GET /api/events/?node=<slug>` — filtrage par nœud |
| Serializer | `backend/apps/organization/serializers.py` — `OrganizationNodeSerializer` avec `parent_slug` |
| Frontend pages | `organisation/page.tsx` (accueil), `organisation/structure/` (organigramme), `organisation/noeuds/` (annuaire), `organisation/noeuds/[slug]/` (fiche nœud) |
| Composants | `OrganigrammeClient.tsx` (arbre, liens vers `/organisation/noeuds/[slug]`), `NodeCard.tsx` (carte pour l’annuaire) |
| API client | `frontend/src/lib/api.ts` — getOrganizationNodes, getOrganizationNodesForStructure, getOrganizationNodeBySlug, getCourses({ node }), getEvents({ node }) |
| Types | `frontend/src/types/organization.ts` — OrganizationNodeApi (parent_slug) |

---

## Comportement

- **/organisation** : deux cartes — Structure (organigramme) et Nœuds (annuaire).
- **/organisation/structure** : organigramme hiérarchique (parent_slug). Clic sur un nœud → **/organisation/noeuds/[slug]** (fiche dédiée).
- **/organisation/noeuds** : grille de cartes (style /artistes), toutes les entrées → fiche nœud.
- **/organisation/noeuds/[slug]** : fiche type profil (hero image, à propos, colonne Cours + Événements du nœud, CTA « Explorer en 3D » vers /explore?node=slug).

---

## Configuration admin

- **Nœuds** : Admin Django → Organization → Noeuds d’organisation (parent, nom, slug, type, image de couverture, descriptions, etc.). Les cours et événements sont reliés à un nœud via leur champ `node`.

---

*Voir aussi : [03-api_docs.md](../bmad/03-api_docs.md) pour les endpoints organization, courses, events.*
