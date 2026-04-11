# Vidéo de fond — routes et mode musique (Accueil / Dédiées)

## Rôle

Le composant `GlobalVideoBackground` ([`ExploreVideos.tsx`](../../frontend/src/components/features/explore/canvas/ExploreVideos.tsx), chargé via [`VideoBackgroundClient`](../../frontend/src/components/features/explore/canvas/VideoBackgroundClient.tsx)) affiche les vidéos configurées sur le site (`main_video`, `cycle_video`, YouTube ou fichiers) et les contrôles (qualité, voile, son, etc.).

La décision **d’afficher ou non** ce bloc pour une URL donnée est centralisée dans [`ClientLayoutWrapper.tsx`](../../frontend/src/components/layout/ClientLayoutWrapper.tsx).

## Contextes React

- `PlanetsOptionsProvider` et `PlanetMusicOverrideProvider` enveloppent **tout** le layout `(main)` (pages publiques), pour que les réglages vidéo / musique (localStorage) et les overrides (planète Explore, fiche partenaire) soient disponibles partout où nécessaire.
- Seul `VideoBackgroundClient` est monté de façon **conditionnelle** (voir ci‑dessous).

## Classification des routes

La fonction [`getPageType`](../../frontend/src/lib/routeSegments.ts) et les helpers du même fichier classent le `pathname` :

| Type | Exemples | Détail dans le code |
|------|----------|---------------------|
| `home` | `/` | |
| `explore` | `/explore`, `/explore/liste` | |
| `user` | `/dashboard`, `/login`, `/register` | jamais de vidéo de fond |
| `detail` | fiches avec slug : `/organisation/noeuds/[slug]`, `/artistes/profils/[username]`, `/shop/...`, bulletins avec slug, `/cours/[slug]`, `/partenaires/evenements/[slug]`, etc. | préfixes dans `DETAIL_PATH_PATTERNS` |
| `menu` | tout le reste (listes, hubs, `/identite-cof/notre-vision`, `/promotions-festivals`, …) | |

Exceptions (fiches « hub » avec ambiance comme le menu) :

- `/partenaires/structures/[slug]` : vidéo globale **toujours** activée via `isPartnerStructureVideoBackgroundPath`.
- `/organisation/noeuds/[slug]` : idem via `isOrganizationNodeVideoBackgroundPath` (la liste `/organisation/noeuds` reste sans fond vidéo).

## Quand la vidéo est affichée

1. **Toujours** sur : `home`, `explore`, `menu`, fiche structure partenaire (`/partenaires/structures/[slug]`), et fiche nœud organisation (`/organisation/noeuds/[slug]`).
2. **En plus**, sur les **autres** pages **`detail`** (hors `user`) lorsque l’utilisateur a choisi le mode **Accueil** : `backgroundMusicMode === "site"`.

En mode **Dédiées**, les autres fiches **detail** (artistes, shop, cours slug, etc.) n’affichent **pas** la vidéo globale : évite les conflits avec les musiques planète / partenaire. Les fiches nœud et structure partenaire font exception (pas d’overlay Explore sur ces URLs, ambiance alignée sur le reste du site).

## Persistance du mode musique

- Clé localStorage : `video_backgroundMusicMode` (voir [`PlanetsOptionsContext`](../../frontend/src/contexts/PlanetsOptionsContext.tsx)).
- Valeurs : `"site"` (bouton **Accueil** — son des vidéos du site uniquement, pas d’override planète/partenaire) ou `"context"` (bouton **Dédiées**).

## Son ambiant (suspension YouTube)

Dans `GlobalVideoBackground`, la suspension `youtubeAmbientSuspended` est levée sur `/`, `/explore`, sur les fiches nœud organisation, **et** lorsque `backgroundMusicMode === "site"`, pour que l’ambiance YouTube reste utilisable sur les routes où le player est monté.

## Fond vidéo (main uniquement)

- Seule **`main_video`** (YouTube ou fichier) est affichée en arrière-plan global. La config admin **`cycle_video`** n’est plus montée dans `GlobalVideoBackground` (un seul lecteur, même visuel sur toutes les routes où le fond est actif, moins d’iframes).
- Les options Planètes « vidéo en fondue / continue » (`enableVideoCycle`, durées) ne pilotent plus ce fond global ; elles peuvent encore concerner d’autres écrans Explore si présents.

## Lecture continue (pas de redémarrage intempestif)

Objectifs techniques :

1. **Ne pas recréer** l’iframe YouTube **main** quand seule la route change (qualité gérée sans `setPlaybackQuality` automatique à chaque navigation) : l’état **qualité** est initialisé selon la première page visitée, puis reste **stable** jusqu’aux boutons 360p–1080p.
2. **`VideoBackgroundClient`** : délai d’environ 400 ms **uniquement** si le tout premier chargement est sur `/`. Dès qu’une page **hors** `/` a été visitée, un retour sur l’accueil en navigation SPA monte tout de suite `GlobalVideoBackground` (pas de `null` intermédiaire qui démonterait les players).

## Fichiers de référence

- [`frontend/src/components/layout/ClientLayoutWrapper.tsx`](../../frontend/src/components/layout/ClientLayoutWrapper.tsx) — `MainChrome`, `showVideo`
- [`frontend/src/lib/routeSegments.ts`](../../frontend/src/lib/routeSegments.ts) — `getPageType`, `isDetailPage`, `isUserPage`, `isPartnerStructureVideoBackgroundPath`, `isOrganizationNodeVideoBackgroundPath`
- [`frontend/src/components/features/explore/canvas/ExploreVideos.tsx`](../../frontend/src/components/features/explore/canvas/ExploreVideos.tsx) — `effectiveOverride`, boutons Accueil / Dédiées, suspension ambiant, qualité « collante », player `main` uniquement
- [`frontend/src/components/features/explore/canvas/VideoBackgroundClient.tsx`](../../frontend/src/components/features/explore/canvas/VideoBackgroundClient.tsx) — délai accueil cold start vs retour SPA
