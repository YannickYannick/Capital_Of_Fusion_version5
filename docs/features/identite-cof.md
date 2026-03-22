# Feature : Identité COF — Notre vision, Notre histoire & Bulletins

Section « Identité COF » du site : pages **Notre vision** et **Notre histoire** (Markdown configurable), **Bulletins d’information** (liste chronologique, éditables par le staff). Menu en premier dans la navbar avec sous-items (Notre vision, Bulletins, etc.).

---

## Où c’est dans le code

| Rôle | Emplacement |
|------|-------------|
| Modèles | `backend/apps/core/models.py` — `SiteConfiguration.vision_markdown`, `Bulletin` (title, slug, content_markdown, published_at, is_published) |
| Admin | `backend/apps/core/admin.py` — Configuration du site (vision), Bulletins d’information |
| API publique | `GET /api/config/` (vision_markdown), `GET /api/identite/bulletins/`, `GET /api/identite/bulletins/<slug>/` |
| API admin (staff) | `GET|PATCH /api/admin/config/` (voir ci-dessous), `GET|POST /api/admin/identite/bulletins/`, `GET|PATCH /api/admin/identite/bulletins/<slug>/` — permission `IsStaffOrSuperUser` ; traductions : `/api/admin/translate/preview|apply|submit-pending/` |
| Serializers | `backend/apps/core/serializers.py` — `SiteConfigurationSerializer`, `BulletinSerializer`, `BulletinAdminSerializer` |
| URLs | `backend/config/api_urls.py` — routes `identite/` et `admin/config/`, `admin/identite/bulletins/` |
| Frontend layout | `frontend/src/app/(main)/identite-cof/layout.tsx` — pt-64 pb-20, max-w-4xl (aligné formations/contenu) |
| Pages | `identite-cof/notre-vision/` (NotreVisionClient), `identite-cof/notre-histoire/` (NotreHistoireClient), `identite-cof/bulletins/` (BulletinsListClient), `bulletins/nouveau`, `bulletins/[slug]`, `bulletins/[slug]/edit` |
| Menu | `frontend/src/components/shared/Navbar.tsx` — entrée « Identité COF » en premier, dropdown Notre vision / Bulletins ; filtre pour éviter doublons si l’API renvoie les sous-pages en racine |
| API client | `frontend/src/lib/api.ts` — getSiteConfig, getBulletins, getBulletinBySlug, patchSiteConfigVision, getAdminBulletins, getAdminBulletinBySlug, createBulletin, patchBulletin |
| Types | `frontend/src/types/config.ts` — SiteConfigurationApi, BulletinApi, BulletinAdminApi |

---

## Comportement

- **Notre vision / Notre histoire** : Markdown lu depuis `SiteConfiguration.vision_markdown` / `history_markdown` (langue selon contexte i18n côté API publique). Staff/admin : édition sur la page, enregistrement via `PATCH /api/admin/config/` (paramètre `?lang=` pour la langue cible du patch FR). **Traduction EN/ES** : UI dédiée (cases Auto/Manuel, modale, aperçus) — voir [traduction-identite-cof-admin.md](./traduction-identite-cof-admin.md).
- **`GET /api/admin/config/`** : retourne `identity_translations` (textes EN/ES déjà enregistrés pour vision et histoire), utilisé comme rappel dans la modale de traduction.
- **Bulletins** : liste du plus récent au plus ancien ; visiteurs ne voient que les publiés (`is_published=True`). Staff/admin voient tous les bulletins (dont brouillons), peuvent « Créer un bulletin » et « Modifier » chaque entrée. Création/édition : formulaire titre, slug, contenu Markdown, date de publication, case « Publié ».
- **Détail bulletin** : page par slug ; staff peut ouvrir un bulletin non publié (appel API admin) et accéder à « Modifier ».

---

## Configuration admin

- **Notre vision** : Admin Django → Configuration du site → section « Identité COF — Notre vision » → champ Markdown.
- **Bulletins** : Admin Django → Bulletins d’information → ajout/édition (titre, slug, contenu Markdown, date de publication, publié). Le menu Identité COF en tête de navbar est géré par `load_initial_data` (order=1) et par le fallback dans la Navbar si l’API ne le renvoie pas.

---

*Voir aussi : [03-api_docs.md](../bmad/03-api_docs.md) pour les endpoints Identité COF ; [traduction-identite-cof-admin.md](./traduction-identite-cof-admin.md) pour le flux traduction staff/admin.*
