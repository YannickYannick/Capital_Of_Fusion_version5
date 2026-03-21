# Traduction FR / EN / ES — Statique, dynamique et inventaire des champs

Document vivant : à adapter selon tes priorités et ton workflow éditorial.

**Index du dossier** : [`README.md`](./README.md) · **Par page (URL)** : [`traduction-par-page.md`](./traduction-par-page.md) · **Visiteur + cibles FR/EN/ES** : [`traduction-visiteur-par-page-fr-en-es.md`](./traduction-visiteur-par-page-fr-en-es.md).

---

## 1. Statique vs dynamique : deux systèmes distincts

| | **Traduction statique (UI)** | **Traduction dynamique (contenu métier)** |
|---|------------------------------|-------------------------------------------|
| **Rôle** | Libellés d’interface : menus génériques, boutons, titres de sections codés en dur dans le front. | Textes produits par l’équipe ou les admins : pages, cours, événements, hero, bulletins, etc. |
| **Où c’est stocké** | Fichiers JSON dans le repo : `frontend/messages/fr.json`, `en.json`, `es.json`. | Base PostgreSQL / SQLite : colonnes séparées par langue (voir tableau §4). |
| **Technologie** | **next-intl** (`NextIntlClientProvider`, `useTranslations`). | **django-modeltranslation** + API Django (`?lang=fr|en|es`). |
| **Quand ça change** | Au **build / déploiement** du frontend (ou édition des JSON + redéploiement). | **À tout moment** : admin Django, pages d’édition du site, commandes, Gemini. |
| **Langue affichée** | Déterminée par le cookie `locale` (fr / en / es) lu par `frontend/src/i18n/request.ts`. | Même cookie : les appels API ajoutent `?lang=` aligné sur cette locale (`frontend/src/lib/api.ts`). |

**En résumé** : le **statique** = ce que les développeurs mettent dans les JSON. Le **dynamique** = ce que tu remplis en base (souvent en français d’abord), puis EN/ES via traduction manuelle, commande `translate_models`, ou popup admin Gemini (selon ce qui est branché).

**Exemples actuels de statique** : clés sous `navbar` dans `messages/*.json` (`language`, `mySpace`, `login`, …). Toute nouvelle clé doit exister dans **les trois** fichiers `fr`, `en`, `es` pour éviter les clés manquantes.

---

## 2. Workflow de traduction (bout en bout)

### Côté visiteur

1. L’utilisateur choisit **FR / EN / ES** (souvent dans la navbar).
2. Le front enregistre le choix dans le cookie **`locale`** (durée longue).
3. **Interface** : next-intl charge le bon fichier `messages/{locale}.json` → textes statiques dans la langue choisie.
4. **Contenu métier** : les Server Components / le client appellent l’API Django avec **`?lang=fr|en|es`** (même valeur que le cookie). Le middleware **`TranslationLanguageMiddleware`** (`backend/apps/core/middleware_translation.py`) active la langue côté Django pour que les serializers renvoient les bons champs traduits.

### Côté édition (contenu dynamique)

1. **Rédaction** souvent en **français** sur les champs « logiques » (ex. `vision_markdown`, `title` d’un bulletin) — en base, cela alimente les colonnes `*_fr` selon la configuration modeltranslation.
2. **Traduction EN/ES** possible via :
   - **Édition manuelle** (admin Django ou pages du site avec droits staff/admin),
   - **`python manage.py translate_models`** (traduction bulk Gemini des champs vides),
   - **Popup « Traduire »** (Gemini) pour les modèles/champs explicitement autorisés dans l’API admin (`/api/admin/translate/preview/`, `/apply/` — liste blanche dans le code).
3. Après sauvegarde, un **rechargement** ou `router.refresh()` peut être nécessaire côté Next pour voir le nouveau texte.

### Règles utiles

- **Slug / URL** : en principe **non traduits** (un seul slug par ressource) ; les titres et corps le sont.
- **Langue par défaut côté Django** : `MODELTRANSLATION_DEFAULT_LANGUAGE = "fr"` (voir `backend/config/settings/base.py`).
- **Fallback** : paramétré dans les settings modeltranslation (ex. repli possible vers le français si une traduction manque — comportement à vérifier selon la version).

---

## 3. Légende des tableaux ci‑dessous

| Colonne | Signification |
|--------|----------------|
| **Modèle** | Modèle Django (`app_label.ModelName`). |
| **Champ (logique)** | Nom du champ dans le modèle Python / admin (sans suffixe de langue). |
| **Colonne FR** | Nom réel de la colonne en base pour le français (`…_fr`). |
| **Colonne EN** | Idem anglais (`…_en`). |
| **Colonne ES** | Idem espagnol (`…_es`). |

Les trois colonnes FR / EN / ES existent **pour chaque champ traduit** enregistré dans `translation.py`. L’API et l’ORM exposent souvent le **nom logique** (`vision_markdown`) : selon la langue active, la lecture/écriture est routée vers la bonne colonne.

---

## 4. Inventaire exhaustif — champs dynamiques (colonnes `*_fr` / `*_en` / `*_es`)

### Core — `SiteConfiguration`

| Modèle | Champ (logique) | Colonne FR | Colonne EN | Colonne ES |
|--------|-------------------|------------|------------|------------|
| `core.SiteConfiguration` | `site_name` | `site_name_fr` | `site_name_en` | `site_name_es` |
| `core.SiteConfiguration` | `hero_title` | `hero_title_fr` | `hero_title_en` | `hero_title_es` |
| `core.SiteConfiguration` | `hero_subtitle` | `hero_subtitle_fr` | `hero_subtitle_en` | `hero_subtitle_es` |
| `core.SiteConfiguration` | `hero_top_text` | `hero_top_text_fr` | `hero_top_text_en` | `hero_top_text_es` |
| `core.SiteConfiguration` | `hero_descr_1` | `hero_descr_1_fr` | `hero_descr_1_en` | `hero_descr_1_es` |
| `core.SiteConfiguration` | `hero_descr_2` | `hero_descr_2_fr` | `hero_descr_2_en` | `hero_descr_2_es` |
| `core.SiteConfiguration` | `hero_btn_1_text` | `hero_btn_1_text_fr` | `hero_btn_1_text_en` | `hero_btn_1_text_es` |
| `core.SiteConfiguration` | `hero_btn_2_text` | `hero_btn_2_text_fr` | `hero_btn_2_text_en` | `hero_btn_2_text_es` |
| `core.SiteConfiguration` | `hero_footer_text` | `hero_footer_text_fr` | `hero_footer_text_en` | `hero_footer_text_es` |
| `core.SiteConfiguration` | `vision_markdown` | `vision_markdown_fr` | `vision_markdown_en` | `vision_markdown_es` |
| `core.SiteConfiguration` | `history_markdown` | `history_markdown_fr` | `history_markdown_en` | `history_markdown_es` |

### Core — `MenuItem`, `Bulletin`, référentiels danse

| Modèle | Champ (logique) | Colonne FR | Colonne EN | Colonne ES |
|--------|-------------------|------------|------------|------------|
| `core.MenuItem` | `name` | `name_fr` | `name_en` | `name_es` |
| `core.Bulletin` | `title` | `title_fr` | `title_en` | `title_es` |
| `core.Bulletin` | `content_markdown` | `content_markdown_fr` | `content_markdown_en` | `content_markdown_es` |
| `core.DanceStyle` | `name` | `name_fr` | `name_en` | `name_es` |
| `core.DanceStyle` | `description` | `description_fr` | `description_en` | `description_es` |
| `core.Level` | `name` | `name_fr` | `name_en` | `name_es` |
| `core.Level` | `description` | `description_fr` | `description_en` | `description_es` |
| `core.DanceProfession` | `name` | `name_fr` | `name_en` | `name_es` |
| `core.DanceProfession` | `description` | `description_fr` | `description_en` | `description_es` |

### Organization

| Modèle | Champ (logique) | Colonne FR | Colonne EN | Colonne ES |
|--------|-------------------|------------|------------|------------|
| `organization.Pole` | `name` | `name_fr` | `name_en` | `name_es` |
| `organization.OrganizationNode` | `name` | `name_fr` | `name_en` | `name_es` |
| `organization.OrganizationNode` | `description` | `description_fr` | `description_en` | `description_es` |
| `organization.OrganizationNode` | `short_description` | `short_description_fr` | `short_description_en` | `short_description_es` |
| `organization.OrganizationNode` | `content` | `content_fr` | `content_en` | `content_es` |
| `organization.OrganizationNode` | `cta_text` | `cta_text_fr` | `cta_text_en` | `cta_text_es` |
| `organization.OrganizationRole` | `name` | `name_fr` | `name_en` | `name_es` |
| `organization.OrganizationRole` | `description` | `description_fr` | `description_en` | `description_es` |
| `organization.NodeEvent` | `title` | `title_fr` | `title_en` | `title_es` |
| `organization.NodeEvent` | `description` | `description_fr` | `description_en` | `description_es` |
| `organization.NodeEvent` | `location` | `location_fr` | `location_en` | `location_es` |
| `organization.TeamMember` | `name` | `name_fr` | `name_en` | `name_es` |
| `organization.TeamMember` | `role` | `role_fr` | `role_en` | `role_es` |
| `organization.TeamMember` | `bio` | `bio_fr` | `bio_en` | `bio_es` |

### Courses

| Modèle | Champ (logique) | Colonne FR | Colonne EN | Colonne ES |
|--------|-------------------|------------|------------|------------|
| `courses.Course` | `name` | `name_fr` | `name_en` | `name_es` |
| `courses.Course` | `description` | `description_fr` | `description_en` | `description_es` |
| `courses.Schedule` | `location_name` | `location_name_fr` | `location_name_en` | `location_name_es` |
| `courses.TheoryLesson` | `title` | `title_fr` | `title_en` | `title_es` |
| `courses.TheoryLesson` | `content` | `content_fr` | `content_en` | `content_es` |

### Events

| Modèle | Champ (logique) | Colonne FR | Colonne EN | Colonne ES |
|--------|-------------------|------------|------------|------------|
| `events.Event` | `name` | `name_fr` | `name_en` | `name_es` |
| `events.Event` | `description` | `description_fr` | `description_en` | `description_es` |
| `events.Event` | `location_name` | `location_name_fr` | `location_name_en` | `location_name_es` |
| `events.EventPass` | `name` | `name_fr` | `name_en` | `name_es` |

---

## 5. Vue par zone produit (priorités & notes)

Les tableaux ci‑dessous reprennent les **champs logiques** par page métier ; le détail des colonnes FR/EN/ES est dans le §4.

### Core — Site, menu, identité, bulletins

| Zone / page | Modèle Django | Champs traduits | Priorité | Notes |
|-------------|---------------|-----------------|----------|-------|
| Accueil / hero | `SiteConfiguration` | `site_name`, `hero_title`, `hero_subtitle`, `hero_top_text`, `hero_descr_1`, `hero_descr_2`, `hero_btn_1_text`, `hero_btn_2_text`, `hero_footer_text` | | |
| Identité — Notre vision | `SiteConfiguration` | `vision_markdown` | | |
| Identité — Notre histoire | `SiteConfiguration` | `history_markdown` | | |
| Navbar | `MenuItem` | `name` | | |
| Bulletins d’information | `Bulletin` | `title`, `content_markdown` | | |

### Organisation

| Zone | Modèle Django | Champs traduits | Priorité | Notes |
|------|---------------|-----------------|----------|-------|
| Pôles | `Pole` | `name` | | |
| Nœuds / pages | `OrganizationNode` | `name`, `description`, `short_description`, `content`, `cta_text` | | |
| Rôles organisation | `OrganizationRole` | `name`, `description` | | |
| Événements liés au nœud | `NodeEvent` | `title`, `description`, `location` | | |
| Membres d’équipe | `TeamMember` | `name`, `role`, `bio` | | |

### Cours & théorie

| Zone | Modèle Django | Champs traduits | Priorité | Notes |
|------|---------------|-----------------|----------|-------|
| Cours | `Course` | `name`, `description` | | |
| Créneaux (lieu) | `Schedule` | `location_name` | | |
| Leçons de théorie | `TheoryLesson` | `title`, `content` | | |

### Événements & référentiels

| Zone | Modèle Django | Champs traduits | Priorité | Notes |
|------|---------------|-----------------|----------|-------|
| Événements | `Event` | `name`, `description`, `location_name` | | |
| Passes / billets | `EventPass` | `name` | | |
| Styles / niveaux / professions | `DanceStyle`, `Level`, `DanceProfession` | `name`, `description` (chaque modèle) | | |

---

## 6. Traduction statique — fichiers à tenir alignés

Pour chaque **clé** utilisée avec `useTranslations`, les trois fichiers doivent contenir la même structure :

| Fichier | Rôle |
|---------|------|
| `frontend/messages/fr.json` | Textes français |
| `frontend/messages/en.json` | Textes anglais |
| `frontend/messages/es.json` | Textes espagnols |

Ajouter une clé = l’ajouter dans **les trois** langues.

---

## 7. Historique des modifications du document

| Date | Auteur | Changement |
|------|--------|------------|
| | | |

---

## 8. Fichiers source dans le code (référence)

| Type | Chemin |
|------|--------|
| Messages UI (statique) | `frontend/messages/fr.json`, `en.json`, `es.json` |
| Config locale Next | `frontend/src/i18n/request.ts` |
| Modeltranslation core | `backend/apps/core/translation.py` |
| Modeltranslation organization | `backend/apps/organization/translation.py` |
| Modeltranslation courses | `backend/apps/courses/translation.py` |
| Modeltranslation events | `backend/apps/events/translation.py` |
| Middleware `?lang=` | `backend/apps/core/middleware_translation.py` |

Si tu ajoutes un champ traduisible dans le code, mets à jour ce document **et** le `translation.py` correspondant, puis régénère les migrations si nécessaire.
