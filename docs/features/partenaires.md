# Feature : Nos partenaires

Section **Nos partenaires** : structures partenaires (annuaire type nœuds d’organisation), événements des partenaires (type festivals) et cours des partenaires (type cours CoF). Données séparées de l’organisation CoF via l’app Django `partners`.

---

## Où c’est dans le code

| Rôle | Emplacement |
|------|-------------|
| Modèles | `backend/apps/partners/models.py` — `Partner`, `PartnerNode`, `PartnerEvent`, `PartnerCourse`, `PartnerSchedule` |
| API nodes | `GET /api/partners/nodes/` (liste), `GET /api/partners/nodes/<slug>/` (détail) ; `?for_structure=1` pour annuaire |
| API events | `GET /api/partners/events/` (liste), `GET /api/partners/events/<slug>/` ; params `type`, `node`, `upcoming` |
| API courses | `GET /api/partners/courses/` (liste), `GET /api/partners/courses/<slug>/` ; params `style`, `level`, `node` |
| Serializers | `backend/apps/partners/serializers.py` — PartnerNodeSerializer, PartnerEventSerializer, PartnerCourseSerializer |
| Vues | `backend/apps/partners/views.py` — listes et détails par slug |
| Frontend pages | `partenaires/layout.tsx`, `partenaires/page.tsx` (hub), `partenaires/structures/`, `partenaires/evenements/`, `partenaires/cours/` (listes + [slug] détail) |
| Composants | `PartnerNodeCard.tsx` (carte structure → `/partenaires/structures/[slug]`) |
| API client | `frontend/src/lib/api.ts` — getPartnerNodes, getPartnerNodesForStructure, getPartnerNodeBySlug, getPartnerEvents, getPartnerEventBySlug, getPartnerCourses, getPartnerCourseBySlug |
| Types | `frontend/src/types/partner.ts` — PartnerNodeApi, PartnerEventApi, PartnerCourseApi, PartnerScheduleApi |

---

## Menu

- **Nos partenaires** est injecté dans la Navbar lorsque le menu vient de l’API (comme Identité COF et En cours), pour qu’il soit toujours visible. Sous-menus : Structures partenaires, Événements des partenaires, Cours des partenaires.
- Optionnel : entrée « Nos partenaires » + 3 enfants dans `load_initial_data.py` (MenuItem) pour cohérence admin.

---

## Admin Django

- **Partners** : Partenaires, Structures partenaires, Événements partenaires, Cours partenaires, Horaires partenaires. Gestion des données en lecture/écriture via l’admin.

---

*Voir aussi : [organisation-noeuds.md](organisation-noeuds.md) pour les nœuds CoF, [03-api_docs.md](../bmad/03-api_docs.md) pour les endpoints.*
