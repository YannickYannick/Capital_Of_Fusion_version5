# SEO — Guide simple (Bachata V5)

**Pourquoi c’est important :** Google (et autres) regardent le **contenu** et les **balises** de tes pages pour décider quoi afficher dans les résultats. Sans SEO basique, ton site est mal ou pas indexé.

---

## Les 5 trucs à retenir

| # | Truc | En bref |
|---|------|--------|
| 1 | **Title** | La phrase qui s’affiche dans l’onglet du navigateur et dans les résultats Google. Unique par page. |
| 2 | **Description** | Le petit texte sous le titre dans Google. Pas obligatoire mais très utile pour le clic. |
| 3 | **URLs propres** | `/cours/bachata-debutant` plutôt qu’`?id=123`. Tu as déjà ça avec les slugs. |
| 4 | **Contenu lisible** | Titres (h1, h2), paragraphes, mots-clés naturels. Pas que des images ou du vide. |
| 5 | **Partage (réseaux)** | Open Graph / Twitter Cards : quand on partage un lien, le titre + description + image s’affichent correctement. |

---

## Étapes qu’on a mises en place

### Étape 1 — Metadata par page (Next.js)

Chaque page (ou layout) peut exporter un objet **metadata** : `title`, `description`, etc. Next.js les met dans le `<head>` en HTML.

- **Layout racine** : titre et description par défaut pour tout le site.
- **Pages statiques** (`/cours`, `/evenements`, `/explore`, `/login`) : titre + description dédiés.
- **Pages dynamiques** (`/cours/[slug]`, `/evenements/[slug]`) : **generateMetadata** : on charge le cours/événement et on met son nom + sa description dans le titre et la meta description.

→ Google voit un titre et une description différents par page = meilleure indexation.

### Étape 2 — Open Graph et Twitter

On ajoute des balises **og:title**, **og:description**, **og:image**, **og:url** (et équivalents Twitter). Quand quelqu’un partage ton lien sur Facebook, Twitter, LinkedIn, etc., le bon titre, texte et image s’affichent.

→ Pas obligatoire pour Google, mais indispensable pour le partage social.

### Étape 3 — `robots.txt`

Fichier à la racine du site (`/robots.txt`) qui dit aux robots (Google, Bing…) ce qu’ils ont le droit de visiter. Souvent : "tout est autorisé" ou "ne pas indexer /admin".

→ Évite d’indexer des pages inutiles (ex. préview, brouillons).

### Étape 4 — Sitemap

Un **sitemap** est une liste d’URLs de ton site. Google s’en sert pour découvrir tes pages. On a ajouté `app/sitemap.ts` qui génère `/sitemap.xml` avec les pages statiques + les URLs des cours et événements (via l’API).

→ En build, si l’API n’est pas dispo, le sitemap contient au moins les pages statiques.

### Étape 5 — Contenu et structure

- **Un seul h1 par page** (le titre principal).
- **Liens internes** : menu, liens "Retour aux cours", etc. Tu as déjà ça.
- **Texte** : les pages cours/événements ont du texte (nom, description) = Google a du contenu à indexer.

Rien de magique : des titres clairs, du texte lisible, des URLs stables.

---

## Où c’est fait dans le code

| Fichier | Rôle SEO |
|---------|----------|
| `app/layout.tsx` | Metadata par défaut + Open Graph + Twitter + `lang="fr"`. |
| `app/(main)/cours/page.tsx` | `metadata` : titre "Cours", description catalogue. |
| `app/(main)/cours/[slug]/page.tsx` | `generateMetadata` : titre = nom du cours, description = extrait. |
| `app/(main)/evenements/page.tsx` | `metadata` : titre "Événements", description calendrier. |
| `app/(main)/evenements/[slug]/page.tsx` | `generateMetadata` : titre = nom de l’événement, description = extrait. |
| `app/(main)/explore/page.tsx` | `metadata` : titre "Explore", description 3D. |
| `app/(main)/login/page.tsx` | `metadata` : titre "Connexion". |
| `app/robots.ts` | Génère `/robots.txt` (Allow tout, disallow /login, lien sitemap). |
| `app/sitemap.ts` | Génère `/sitemap.xml` (pages statiques + liste cours + événements). |

---

## Vérifier que ça marche

1. **Onglet du navigateur** : en allant sur une page, le titre dans l’onglet doit être celui qu’on a défini (ex. "Bachata Débutant — Capital of Fusion").
2. **Code source** : Clic droit → "Afficher le code source" : tu dois voir `<meta name="description" ...>` et des balises `og:` dans le `<head>`.
3. **Outils en ligne** (plus tard) : [Google Search Console](https://search.google.com/search-console), "Test d’optimisation mobile", ou des extensions type "SEO Meta in 1 Click" pour vérifier titre / description / OG.

---

## Résumé "bitch"

1. **Title + description** sur chaque page (statique ou via generateMetadata).
2. **Open Graph + Twitter** pour le partage.
3. **robots.txt** pour dire aux robots ce qu’ils peuvent crawler.
4. **Contenu** : h1, texte, URLs propres (déjà en place).

Tu n’as pas besoin de tout savoir : on a mis le minimum propre dans le code ; tu peux compléter plus tard (sitemap, Search Console, mots-clés ciblés) si tu veux pousser le SEO plus loin.
