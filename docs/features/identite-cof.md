# Feature : Identité COF — Notre vision & Bulletins

Section « Identité COF » du site : page **Notre vision** (Markdown configurable) et **Bulletins d’information** (liste chronologique, éditables par le staff). Menu en premier dans la navbar avec sous-items Notre vision / Bulletins.

---

## Où c’est dans le code

| Rôle | Emplacement |
|------|-------------|
| Modèles | `backend/apps/core/models.py` — `SiteConfiguration.vision_markdown`, `Bulletin` (title, slug, content_markdown, published_at, is_published) |
| Admin | `backend/apps/core/admin.py` — Configuration du site (vision), Bulletins d’information |
| API publique | `GET /api/config/` (vision_markdown), `GET /api/identite/bulletins/`, `GET /api/identite/bulletins/<slug>/` |
| API admin (staff) | `PATCH /api/admin/config/`, `GET|POST /api/admin/identite/bulletins/`, `GET|PATCH /api/admin/identite/bulletins/<slug>/` — permission `IsStaffOrSuperUser` |
| Serializers | `backend/apps/core/serializers.py` — `SiteConfigurationSerializer`, `BulletinSerializer`, `BulletinAdminSerializer` |
| URLs | `backend/config/api_urls.py` — routes `identite/` et `admin/config/`, `admin/identite/bulletins/` |
| Frontend layout | `frontend/src/app/(main)/identite-cof/layout.tsx` — pt-64 pb-20, max-w-4xl (aligné formations/contenu) |
| Pages | `identite-cof/notre-vision/` (NotreVisionClient), `identite-cof/bulletins/` (BulletinsListClient), `bulletins/nouveau`, `bulletins/[slug]`, `bulletins/[slug]/edit` |
| Menu | `frontend/src/components/shared/Navbar.tsx` — entrée « Identité COF » en premier, dropdown Notre vision / Bulletins ; filtre pour éviter doublons si l’API renvoie les sous-pages en racine |
| API client | `frontend/src/lib/api.ts` — getSiteConfig, getBulletins, getBulletinBySlug, patchSiteConfigVision, getAdminBulletins, getAdminBulletinBySlug, createBulletin, patchBulletin |
| Types | `frontend/src/types/config.ts` — SiteConfigurationApi, BulletinApi, BulletinAdminApi |

---

## Comportement

- **Notre vision** : contenu Markdown lu depuis `SiteConfiguration.vision_markdown`. Staff/admin voient un bouton « Modifier la vision » et peuvent enregistrer via `PATCH /api/admin/config/`.
- **Bulletins** : liste du plus récent au plus ancien ; visiteurs ne voient que les publiés (`is_published=True`). Staff/admin voient tous les bulletins (dont brouillons), peuvent « Créer un bulletin » et « Modifier » chaque entrée. Création/édition : formulaire titre, slug, contenu Markdown, date de publication, case « Publié ».
- **Détail bulletin** : page par slug ; staff peut ouvrir un bulletin non publié (appel API admin) et accéder à « Modifier ».

---

## Configuration admin

- **Notre vision** : Admin Django → Configuration du site → section « Identité COF — Notre vision » → champ Markdown.
- **Bulletins** : Admin Django → Bulletins d’information → ajout/édition (titre, slug, contenu Markdown, date de publication, publié). Le menu Identité COF en tête de navbar est géré par `load_initial_data` (order=1) et par le fallback dans la Navbar si l’API ne le renvoie pas.

---

*Voir aussi : [03-api_docs.md](../bmad/03-api_docs.md) pour les endpoints Identité COF.*
