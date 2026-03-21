# Traduction par page (parcours URL)

Document complémentaire de [`traduction-pages-et-champs.md`](./traduction-pages-et-champs.md) : ici le contenu est **trié par page / route**, pas par modèle Django. **Tableau visiteur (3 colonnes FR/EN/ES)** : [`traduction-visiteur-par-page-fr-en-es.md`](./traduction-visiteur-par-page-fr-en-es.md) · [`README`](./README.md).

**Légende**

| Terme | Signification |
|-------|----------------|
| **Dynamique (BDD)** | Texte servi par l’API Django selon `?lang=` — champs `*_fr` / `*_en` / `*_es` (voir inventaire détaillé dans l’autre doc). |
| **Statique (UI)** | Fichiers `frontend/messages/{fr,en,es}.json` (**next-intl**) ou textes encore **en dur** dans les composants React. |
| **Mixte** | Les deux (ex. titres de page en dur + données API traduites). |

---

## Accueil & layout global

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/`** (landing) | Via le layout : `SiteConfiguration` (vidéos, cycle, etc.). Les gros titres / sous-titres du hero sur la landing peuvent être **en dur** dans `LandingPageClient.tsx` — à migrer vers `messages/*.json` ou vers les champs `hero_*` si tu unifies. | Navbar : libellés partiels **next-intl** (`navbar.*`) + entrées de menu depuis **`MenuItem.name`** (API). |
| **Toutes les pages `(main)`** | Même **`getSiteConfig()`** dans le layout : champs hero globaux utilisés selon les composants (ex. fond vidéo). | Cookie **`locale`** pour FR/EN/ES. |

---

## Identité COF

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/identite-cof`** | Redirection ou hub — peu de contenu propre. | Textes d’UI dans les composants. |
| **`/identite-cof/notre-vision`** | **`SiteConfiguration.vision_markdown`** | Titres / légendes de page souvent en dur dans le composant ; édition staff du corps via markdown. |
| **`/identite-cof/notre-histoire`** | **`SiteConfiguration.history_markdown`** | Idem. |
| **`/identite-cof/bulletins`** | Liste : **`Bulletin`** (titres via liste API). | Textes de page (titres de section) : composant. |
| **`/identite-cof/bulletins/[slug]`** | Détail : **`Bulletin.title`**, **`Bulletin.content_markdown`** | |
| **`/identite-cof/bulletins/nouveau`**, **`/identite-cof/bulletins/[slug]/edit`** | Saisie des champs traduits côté admin (mêmes champs bulletin). | Labels de formulaire : UI. |

---

## Organisation

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/organisation`** | Hub. | Textes d’intro en dur ou à extraire vers `messages`. |
| **`/organisation/structure`** | **`OrganizationNode`** (noms, descriptions courtes, contenu pour l’organigramme selon API utilisée). | |
| **`/organisation/poles`** | **`Pole.name`** | |
| **`/organisation/noeuds`** | Liste **`OrganizationNode`** (noms, etc.). | |
| **`/organisation/noeuds/[slug]`** | **`OrganizationNode`** : `name`, `short_description`, `description`, `content`, `cta_text` + cours / événements liés (voir ci‑dessous). | **`Course`**, **`Event`** rattachés au nœud. |
| **`/organisation/staff`** | **`TeamMember`** : `name`, `role`, `bio` (si exposé par l’API utilisée sur cette page). | Vérifier le client : champs renvoyés par le backend. |

---

## Cours

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/cours`** | Liste **`Course`** : `name`, `description`. Filtres : **`DanceStyle`**, **`Level`**, **`DanceProfession`** (référentiels). | Libellés de filtres : mix API + UI. |
| **`/cours/[slug]`** | Détail **`Course`** : `name`, `description`. **`Schedule.location_name`** pour les créneaux affichés. | |
| **`/cours/planning`**, **`/cours/programmes`**, **`/cours/filtres`**, **`/cours/inscription`** | Données **`Course`** / **`Schedule`** selon la page. | Beaucoup de textes d’aide peuvent être en dur → `messages` ou CMS plus tard. |

---

## Événements

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/evenements`** | **`Event`** : `name`, `description`, `location_name`. | |
| **`/evenements/[slug]`** | Détail **`Event`** (mêmes champs). **`EventPass.name`** si passes affichées. | |
| **`/evenements/festivals`** | Sous-ensemble **`Event`** (type festival). | |

---

## Explore 3D

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/explore`** | **`OrganizationNode`** (sphères / labels), **`SiteConfiguration`** (config explore / vidéos). | Options UI : contexte React ; partie traduisible selon implémentation. |
| **`/explore/liste`** | Liste **`OrganizationNode`**. | |

---

## Formations (vue cours)

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/formations`**, **`/formations/contenu`**, **`/formations/categories`**, **`/formations/videotheque`** | Souvent **`Course`** (liste / cartes). | Textes pédagogiques de page : souvent en dur. |

---

## Théorie

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/theorie`**, **`/theorie/progression`**, **`/theorie/quiz`** | **`TheoryLesson`** si listé (`title`, `content`). | Beaucoup d’UI placeholder possible. |
| **`/theorie/cours`** | CRUD / liste **`TheoryLesson`** : `title`, `content`. | |

---

## Partenaires

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/partenaires`**, **`/partenaires/structures`**, **`/partenaires/structures/[slug]`** | Souvent **`OrganizationNode`** ou entités partenaires selon API — aligné sur les modèles exposés. | |
| **`/partenaires/evenements`**, **`/partenaires/evenements/[slug]`** | **`Event`**. | |
| **`/partenaires/cours`**, **`/partenaires/cours/[slug]`** | **`Course`**. | |

---

## Autres sections (principalement UI ou données métier à confirmer)

| Route | Contenu dynamique (BDD) | Statique / remarques |
|-------|-------------------------|----------------------|
| **`/shop`**, **`/shop/...`** | Produits / catégories shop (modèles dédiés si traduits — **non listés** dans `translation.py` actuel pour le shop). | Vérifier `apps/shop` si i18n ajoutée plus tard. |
| **`/care`**, **`/care/...`** | Services / praticiens (selon modèles `care`). | Idem : pas dans les `translation.py` listés pour le cœur du doc technique. |
| **`/projets`**, **`/projets/...`** | Projets (`projects`) — traduction selon modèles du projet. | |
| **`/trainings`**, **`/trainings/...`** | Sessions / adhérents. | |
| **`/artistes`**, **`/artistes/...`** | Profils artistes (souvent **`User`** / données artists, hors modeltranslation standard du tableau core). | |
| **`/promotions-festivals`** | **`Event`** (festivals). | |
| **`/fichiers`** | Médias / téléchargements. | |
| **`/login`**, **`/register`**, **`/dashboard`**, **`/dashboard/pending-edits`** | Auth + files d’attente ; **pending edits** peut porter sur contenus traduits. | Libellés formulaires : **next-intl** ou en dur. |

---

## Menu & navigation (toutes pages)

| Source | Contenu dynamique (BDD) | Statique |
|--------|-------------------------|----------|
| **Navbar** | **`MenuItem.name`** (items pilotés par l’admin Django). | Libellés **next-intl** (`navbar.language`, etc.) + entrées **injectées en dur** dans `Navbar.tsx` (ex. « Identité COF », « En cours », …) — à internationaliser via `messages` si besoin. |

---

## Comment utiliser ce document avec l’autre

1. **Par parcours utilisateur** → ce fichier (**par page**).
2. **Noms exacts des colonnes FR / EN / ES** → [`traduction-pages-et-champs.md`](./traduction-pages-et-champs.md) § inventaire.
3. **Workflow global** (cookie, API, statique) → section 1–2 de [`traduction-pages-et-champs.md`](./traduction-pages-et-champs.md).

---

## Historique

| Date | Auteur | Changement |
|------|--------|------------|
| | | |
