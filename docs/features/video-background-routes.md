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

Exception : `/partenaires/structures/[slug]` est à la fois une route **detail** et une route où la vidéo globale est **toujours** activée (musique de structure possible), via `isPartnerStructureVideoBackgroundPath`.

## Quand la vidéo est affichée

1. **Toujours** sur : `home`, `explore`, `menu`, et fiche structure partenaire (`/partenaires/structures/[slug]`).
2. **En plus**, sur les pages **`detail`** (hors `user`) lorsque l’utilisateur a choisi le mode **Accueil** dans l’overlay vidéo : `backgroundMusicMode === "site"`.

En mode **Dédiées** (`backgroundMusicMode === "context"`), les pages **detail** n’affichent **pas** la vidéo globale : évite les incohérences avec les musiques planète / partenaire sans refonte complète du flux d’override sur ces pages.

## Persistance du mode musique

- Clé localStorage : `video_backgroundMusicMode` (voir [`PlanetsOptionsContext`](../../frontend/src/contexts/PlanetsOptionsContext.tsx)).
- Valeurs : `"site"` (bouton **Accueil** — son des vidéos du site uniquement, pas d’override planète/partenaire) ou `"context"` (bouton **Dédiées**).

## Son ambiant (suspension YouTube)

Dans `GlobalVideoBackground`, la suspension `youtubeAmbientSuspended` est levée sur `/`, `/explore`, **et** lorsque `backgroundMusicMode === "site"`, pour que le mode Accueil garde l’ambiance YouTube audible sur toutes les routes où le player est monté.

## Fichiers de référence

- [`frontend/src/components/layout/ClientLayoutWrapper.tsx`](../../frontend/src/components/layout/ClientLayoutWrapper.tsx) — `MainChrome`, `showVideo`
- [`frontend/src/lib/routeSegments.ts`](../../frontend/src/lib/routeSegments.ts) — `getPageType`, `isDetailPage`, `isUserPage`, `isPartnerStructureVideoBackgroundPath`
- [`frontend/src/components/features/explore/canvas/ExploreVideos.tsx`](../../frontend/src/components/features/explore/canvas/ExploreVideos.tsx) — `effectiveOverride`, boutons Accueil / Dédiées, suspension ambiant
