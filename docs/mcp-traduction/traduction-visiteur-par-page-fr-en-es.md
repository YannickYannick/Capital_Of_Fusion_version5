# Ce que voit l’utilisateur — par page — cibles FR / EN / ES

**Objectif :** une ligne par **zone visible** (ou par champ métier), avec **trois colonnes** indiquant **où** est la variante française, anglaise et espagnole (pour trier, migrer ou brancher des outils). Dossier : [`README.md`](./README.md).

**À ne pas confondre :**
- **Dynamique (BDD)** : le texte affiché vient de la colonne indiquée (`mon_champ_fr`, etc.) quand `locale=fr` et l’API renvoie la bonne langue.
- **Statique (UI)** : les **valeurs** diffèrent selon le fichier `frontend/messages/{fr|en|es}.json` ; les **clés** (`navbar.login`, …) sont souvent identiques dans les trois fichiers.
- **En dur** : texte dans le JSX sans `useTranslations` ni donnée API — à terme, migrer vers `messages` ou la BDD.

| Colonne | Signification |
|---------|----------------|
| **Cible FR** | Colonne BDD `…_fr` ou fichier / remarque pour le français. |
| **Cible EN** | Colonne BDD `…_en` ou `messages/en.json`. |
| **Cible ES** | Colonne BDD `…_es` ou `messages/es.json`. |

---

## Global — toutes les pages `(main)`

| Page / contexte | Zone visible (utilisateur) | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|-----------------|----------------------------|------|-------------|----------|----------|----------|
| Layout | Libellés navbar (Langue, Connexion, Mon espace, …) | statique | clés `navbar.*` | `messages/fr.json` | `messages/en.json` | `messages/es.json` |
| Layout | Libellés menu déroulant (Identité COF, En cours, …) codés dans `Navbar.tsx` | en dur / partiel | — | À migrer `messages` | idem | idem |
| Layout | Entrées du menu pilotées par l’API | dynamique | `MenuItem.name` | `name_fr` | `name_en` | `name_es` |
| Layout | Fond vidéo / config site (selon composants) | dynamique | `SiteConfiguration` (vidéos, etc.) | champs non traduits ou partiels | idem | idem |

---

## `/` — Accueil (landing)

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/` | Titres / sous-titres hero (ex. « Capital of Fusion », accroches) | en dur | `LandingPageClient.tsx` | Texte FR | Texte en dur EN | Texte en dur ES |
| `/` | Hero si unifié avec `SiteConfiguration` (option future) | dynamique | `hero_title`, `hero_subtitle`, … | `hero_title_fr`, … | `hero_title_en`, … | `hero_title_es`, … |
| `/` | Boutons CTA (Commencer, Voir les cours) | en dur | composant | — | — | — |

---

## Identité COF

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/identite-cof/notre-vision` | Corps de la page « Notre vision » | dynamique | `vision_markdown` | `vision_markdown_fr` | `vision_markdown_en` | `vision_markdown_es` |
| `/identite-cof/notre-histoire` | Corps « Notre histoire » | dynamique | `history_markdown` | `history_markdown_fr` | `history_markdown_en` | `history_markdown_es` |
| `/identite-cof/bulletins` | Titre de chaque carte bulletin | dynamique | `Bulletin.title` | `title_fr` | `title_en` | `title_es` |
| `/identite-cof/bulletins/[slug]` | Titre du bulletin | dynamique | `title` | `title_fr` | `title_en` | `title_es` |
| `/identite-cof/bulletins/[slug]` | Contenu markdown | dynamique | `content_markdown` | `content_markdown_fr` | `content_markdown_en` | `content_markdown_es` |
| `/identite-cof/bulletins/*/edit` | Même saisie que le détail (édition) | dynamique | `title`, `content_markdown` | `*_fr` | `*_en` | `*_es` |

---

## Organisation

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/organisation/poles` | Nom de chaque pôle | dynamique | `Pole.name` | `name_fr` | `name_en` | `name_es` |
| `/organisation/structure` | Noms / descriptions nœuds (organigramme) | dynamique | `OrganizationNode` (champs traduits) | `name_fr`, `description_fr`, … | `*_en` | `*_es` |
| `/organisation/noeuds/[slug]` | Titre, chapô, contenu, CTA | dynamique | `name`, `short_description`, `description`, `content`, `cta_text` | `*_fr` | `*_en` | `*_es` |
| `/organisation/staff` | Nom, rôle, bio membres | dynamique | `TeamMember` | `name_fr`, `role_fr`, `bio_fr` | `*_en` | `*_es` |

---

## Cours

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/cours` | Nom + description des cours | dynamique | `Course.name`, `Course.description` | `*_fr` | `*_en` | `*_es` |
| `/cours` | Libellés filtres (styles, niveaux, professions) | dynamique | `DanceStyle`, `Level`, `DanceProfession` | `name_fr`, `description_fr`, … | `*_en` | `*_es` |
| `/cours/[slug]` | Détail cours | dynamique | `Course` | `*_fr` | `*_en` | `*_es` |
| `/cours/[slug]` | Lieu des créneaux | dynamique | `Schedule.location_name` | `location_name_fr` | `location_name_en` | `location_name_es` |
| `/cours/planning`, `/programmes`, `/filtres`, `/inscription` | Textes d’aide / titres de page | en dur / mixte | composants | `messages` ou BDD | idem | idem |

---

## Événements

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/evenements` | Nom, description, lieu | dynamique | `Event.name`, `description`, `location_name` | `*_fr` | `*_en` | `*_es` |
| `/evenements/[slug]` | Détail + passes | dynamique | `Event` + `EventPass.name` | `*_fr` | `*_en` | `*_es` |
| `/evenements/festivals` | Liste festivals | dynamique | `Event` | `*_fr` | `*_en` | `*_es` |

---

## Explore 3D

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/explore`, `/explore/liste` | Nom des nœuds / planètes | dynamique | `OrganizationNode.name` | `name_fr` | `name_en` | `name_es` |

---

## Formations & théorie

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/formations/*` | Cartes cours (souvent) | dynamique | `Course` | `*_fr` | `*_en` | `*_es` |
| `/theorie/cours` | Titres + contenu leçons | dynamique | `TheoryLesson.title`, `content` | `*_fr` | `*_en` | `*_es` |

---

## Partenaires

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/partenaires/structures`, `/structures/[slug]` | Contenu selon API | dynamique | souvent `OrganizationNode` | `*_fr` | `*_en` | `*_es` |
| `/partenaires/evenements`, `/evenements/[slug]` | Événements | dynamique | `Event` | `*_fr` | `*_en` | `*_es` |
| `/partenaires/cours`, `/cours/[slug]` | Cours | dynamique | `Course` | `*_fr` | `*_en` | `*_es` |

---

## Autres (à affiner au cas par cas)

| Page | Zone visible | Type | Identifiant | Cible FR | Cible EN | Cible ES |
|------|--------------|------|-------------|----------|----------|----------|
| `/shop/*` | Produits / catégories | BDD hors `translation.py` core | modèles `shop` | — | — | — |
| `/care/*` | Soins / praticiens | BDD `care` | — | — | — | — |
| `/login`, `/register` | Libellés formulaires | statique / en dur | `messages` ou JSX | `messages/fr.json` | `messages/en.json` | `messages/es.json` |
| `/dashboard/pending-edits` | File d’attente | métier | `PendingContentEdit` | — | — | — |

---

## Comment lire les colonnes identiques

Pour un **même** champ logique (ex. `vision_markdown`), les trois colonnes **cible** portent le **même préfixe** avec `_fr`, `_en`, `_es` : c’est le même **attribut métier**, trois **stockages** distincts.

---

## Voir aussi

- Inventaire détaillé des colonnes : [`traduction-pages-et-champs.md`](./traduction-pages-et-champs.md)
- Par route (sans tableau 3 langues) : [`traduction-par-page.md`](./traduction-par-page.md)  
- Index du dossier : [`README.md`](./README.md)

---

## Historique

| Date | Auteur | Changement |
|------|--------|------------|
| | | |
