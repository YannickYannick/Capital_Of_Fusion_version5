# Musique de fond — mode 🏠 Accueil (`backgroundMusicMode: site`)

## Comportement voulu

Lorsque l’utilisateur choisit le bouton **🏠 Accueil** dans les contrôles du fond vidéo (bas à droite), le site ignore les musiques « contextuelles » (planètes sur Explore, musiques des fiches structure partenaire).  
En plus, **la bande-son est alignée sur la page d’accueil** : une seule source, la vidéo **`main_video`** (config site / `SiteConfiguration`), **sur toutes les pages qui affichent le fond vidéo global**, pas seulement sur `/`.

## Exception : `/explore`

Sur **`/explore`**, le cycle vidéo (`cycle_video`) reste utilisé (alternance visible/cachée selon les options « cycle ») pour garder l’expérience immersive de la scène 3D. Le mode `site` continue d’**ignorer** les overrides planète / partenaire sur cette route.

## Pages sans fond vidéo global

Les routes exclues dans `ExploreVideos` (`/dashboard`, `/login`, `/register`, etc.) et les pages **détail** sans `GlobalVideoBackground` n’ont pas ce comportement — pas de lecteur ambiant.

## Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `frontend/src/components/features/explore/canvas/ExploreVideos.tsx` | `GlobalVideoBackground` : flag `siteMainOnlySound`, masque le cycle et ne monte pas le player cycle (YouTube / MP4) hors `/explore`. |
| `frontend/src/contexts/PlanetsOptionsContext.tsx` | État `backgroundMusicMode`, persistance localStorage (`video_backgroundMusicMode`). |
| `frontend/src/contexts/PlanetMusicOverrideContext.tsx` | Overrides musique planète / partenaire (désactivés en effet quand `site` car `effectiveOverride` est forcé à `null` dans ExploreVideos). |

## Persistance du réglage « son activé »

Le mute / unmute est géré dans le state React du composant de fond : tant que l’utilisateur ne recharge pas la page et ne change pas de layout qui démonte le provider, **le choix « Son activé » reste** en naviguant entre les pages menu.

## Voir aussi

- [Partenaires — musique fiche structure](partenaires-structure-musique-fond.md) (mode **Dédiées**).
- [Landing — i18n + fond vidéo](landing-config.md).
