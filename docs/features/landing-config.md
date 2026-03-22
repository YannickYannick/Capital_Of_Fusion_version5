# Feature : Landing — Textes i18n + fond vidéo global

La page d’accueil (`/`) affiche le hero via **next-intl** (fichiers `messages/*.json`, clés `landing.*`). Le fond vidéo et le **voile** (option **A: Voile**) sont gérés par **`GlobalVideoBackground`** (`ExploreVideos.tsx`), comme sur toutes les pages « menu » — pas de second voile local sur l’accueil (aligné avec ex. `/identite-cof/notre-vision`).

---

## Où c’est dans le code

| Rôle | Emplacement |
|------|-------------|
| Textes du hero (FR / EN / ES) | `frontend/messages/fr.json`, `en.json`, `es.json` — objet **`landing`** : `badge`, `title`, `subtitle1`, `subtitle2`, `ctaExplore`, `ctaCourses`, `footerLine` |
| Composant | `frontend/src/app/(main)/LandingPageClient.tsx` — `useTranslations("landing")`, liens `/explore` et `/cours` |
| Metadata SEO (statique FR) | `frontend/src/app/(main)/page.tsx` |
| Vidéo + voile + contrôles | `ClientLayoutWrapper` → `VideoBackgroundClient` → `GlobalVideoBackground` (`frontend/src/components/features/explore/canvas/ExploreVideos.tsx`) |

---

## Contenu éditorial (landing)

Pour modifier les textes visibles sur l’accueil : éditer les trois fichiers `messages/{fr,en,es}.json` sous **`landing`**, puis déployer le frontend.

**Note :** le modèle Django `SiteConfiguration` peut encore exposer des champs hero (`hero_*`) pour d’autres usages ou l’API ; l’affichage actuel du hero sur Next utilise les **messages i18n**, pas un fetch de ces champs pour le libellé principal.

---

## Fond et voile

- **Voile unique** : calque `bg-black/50` quand l’option **A: Voile** est active (état persisté via `PlanetsOptionsContext` / localStorage).
- Pas de dégradé supplémentaire spécifique à la landing : même pile visuelle que les autres pages avec vidéo de fond.
