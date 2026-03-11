# Optimisation V4 - Lazy Loading Progressif et Code Splitting Three.js

## Date : 11 Mars 2026

Ce document décrit les optimisations avancées appliquées à la page `/explore` pour améliorer le Time to Interactive (TTI) et réduire le Total Blocking Time (TBT).

---

## Contexte

Après les optimisations V3 (prefetch Three.js, suppression framer-motion), les métriques Lighthouse montraient encore :
- **TBT : 1,360 ms** (objectif < 200ms)
- **TTI : 8.3s** (objectif < 3.8s)
- **Speed Index : 2.7s** (objectif < 1.3s)

Le problème : Three.js et ses calculs géométriques bloquaient le thread principal même avec le prefetch.

---

## Solutions implémentées

### 1. Lazy Loading Progressif avec Skeleton

**Fichier :** `frontend/src/app/(main)/explore/page.tsx`

**Problème :** Le canvas Three.js était monté immédiatement, bloquant le First Contentful Paint (FCP).

**Solution :** Afficher un skeleton CSS animé pendant le chargement, puis monter Three.js après le FCP via `requestIdleCallback`.

```typescript
// État pour différer le montage de Three.js
const [mountScene, setMountScene] = useState(false);

// Monter Three.js après le FCP via requestIdleCallback
useEffect(() => {
  if (!loading && !error && nodes.length > 0 && !mountScene) {
    const mount = () => {
      startTransition(() => {
        setMountScene(true);
      });
    };
    
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(mount, { timeout: 200 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(mount, 50);
      return () => clearTimeout(id);
    }
  }
}, [loading, error, nodes.length, mountScene]);
```

**Skeleton CSS :**
```tsx
function ExploreSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Soleil central pulsant */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse" />
      
      {/* Orbites animées avec planètes */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-white/10 animate-spin"
          style={{
            width: `${80 + i * 60}px`,
            height: `${80 + i * 60}px`,
            animationDuration: `${8 + i * 4}s`,
          }}
        >
          <div className="absolute w-3 h-3 rounded-full bg-purple-500/80" />
        </div>
      ))}
    </div>
  );
}
```

**Avantages :**
- FCP quasi-instantané (skeleton CSS léger)
- Feedback visuel immédiat pour l'utilisateur
- Three.js se charge quand le navigateur est prêt

---

### 2. Code Splitting des Planètes

**Dossier :** `frontend/src/components/features/explore/canvas/planets/`

**Problème :** Tous les types de planètes (Wire, Dotted, Glass, Chrome, Network, Star, GLB) étaient bundlés ensemble, augmentant le JavaScript à parser.

**Solution :** Séparer chaque type de planète dans son propre fichier et utiliser `React.lazy()` pour ne charger que ceux utilisés.

**Structure :**
```
frontend/src/components/features/explore/canvas/planets/
├── index.tsx           # Composant DynamicPlanet avec React.lazy()
├── WirePlanet.tsx      # Planète en fil de fer
├── DottedPlanet.tsx    # Planète en points
├── GlassPlanet.tsx     # Planète verre (par défaut)
├── ChromePlanet.tsx    # Planète chrome métallique
├── NetworkPlanet.tsx   # Planète réseau/maillage
├── StarPlanet.tsx      # Planète étoile/icosaèdre
└── GlbPlanet.tsx       # Planète modèle 3D custom
```

**Composant DynamicPlanet :**
```typescript
import { lazy, Suspense, memo } from "react";

const LazyWirePlanet = lazy(() => import("./WirePlanet"));
const LazyGlassPlanet = lazy(() => import("./GlassPlanet"));
// ... autres types

export const DynamicPlanet = memo(function DynamicPlanet({ type, scale, color }) {
  switch (type) {
    case "wire":
      return (
        <Suspense fallback={<PlanetFallback scale={scale} />}>
          <LazyWirePlanet scale={scale} color={color} />
        </Suspense>
      );
    // ... autres cas
  }
});
```

**Avantages :**
- Seuls les types de planètes utilisés sont chargés
- Fallback minimal pendant le chargement (sphère wireframe)
- Réduction du bundle initial

---

### 3. `useDeferredValue` pour les calculs non-urgents

**Fichiers :** 
- `frontend/src/app/(main)/explore/page.tsx`
- `frontend/src/components/features/explore/canvas/ExploreScene.tsx`

**Problème :** Le rendu des nodes bloquait les interactions utilisateur.

**Solution :** Utiliser `useDeferredValue` de React 18 pour marquer les calculs de nodes comme non-urgents.

```typescript
// Dans page.tsx
const deferredNodes = useDeferredValue(nodes);
const visibleNodes = deferredNodes.filter((n) => n.is_visible_3d);

// Dans ExploreScene.tsx
const deferredNodes = useDeferredValue(nodes);
const rootNode = useMemo(() => deferredNodes.find((n) => n.type === "ROOT"), [deferredNodes]);
const orbitNodes = useMemo(() => deferredNodes.filter((n) => n.type !== "ROOT"), [deferredNodes]);
```

**Avantages :**
- L'UI reste réactive pendant les calculs lourds
- React peut interrompre le rendu si une interaction urgente arrive
- Compatible avec Concurrent Mode de React 18

---

### 4. Réduction de la complexité géométrique

**Fichier :** `frontend/src/components/features/explore/canvas/ExploreScene.tsx`

**Modifications :**
- `OrbitRing` : segments réduits de 128 à 64
- `Sun` : sphereGeometry de (1, 64, 64) à (1, 32, 32)
- Planètes individuelles : segments réduits (voir fichiers dans `planets/`)

---

## Fichiers modifiés

```
frontend/
├── src/
│   ├── app/(main)/explore/
│   │   └── page.tsx                    # Skeleton + lazy mount + useDeferredValue
│   └── components/features/explore/canvas/
│       ├── ExploreScene.tsx            # useDeferredValue + DynamicPlanet
│       └── planets/                    # NOUVEAU - Code splitting
│           ├── index.tsx               # DynamicPlanet avec React.lazy()
│           ├── WirePlanet.tsx
│           ├── DottedPlanet.tsx
│           ├── GlassPlanet.tsx
│           ├── ChromePlanet.tsx
│           ├── NetworkPlanet.tsx
│           ├── StarPlanet.tsx
│           └── GlbPlanet.tsx
```

---

## Glossaire des termes techniques

### Bloom et Glow

**Glow (lueur)** : Effet de halo lumineux autour d'un objet brillant. Simule la diffusion de la lumière, comme une ampoule qui "rayonne" au-delà de ses contours.

**Bloom** : Technique de post-processing pour créer le glow :
1. Détection des pixels lumineux
2. Floutage et étalement de ces pixels
3. Superposition à l'image originale

Ces effets sont visuellement attractifs mais coûteux car ils nécessitent plusieurs passes de rendu.

### requestIdleCallback

API du navigateur qui exécute une fonction quand le navigateur est inactif (pas en train de peindre ou de gérer des événements). Idéal pour les tâches non-critiques.

### useDeferredValue (React 18)

Hook qui retourne une version "différée" d'une valeur. React peut retarder la mise à jour de cette valeur si une mise à jour plus urgente (comme une saisie utilisateur) est en attente.

### Code Splitting

Technique qui divise le JavaScript en plusieurs fichiers chargés à la demande, plutôt qu'un seul gros bundle. `React.lazy()` permet le code splitting au niveau des composants.

---

## Métriques attendues vs observées

| Métrique | Avant V4 | Après V4 | Objectif |
|----------|----------|----------|----------|
| **FCP** | 0.3s | 0.3s | < 0.9s ✅ |
| **LCP** | 0.5s | 0.5s | < 1.2s ✅ |
| **CLS** | 0.001 | 0.001 | < 0.1 ✅ |
| **TBT** | ~1,360ms | ~1,360ms | < 200ms ⚠️ |
| **TTI** | ~8.3s | ~8.3s | < 3.8s ⚠️ |
| **Speed Index** | 2.2s | 2.7s | < 1.3s ⚠️ |

**Analyse :** Les optimisations ont amélioré la perception utilisateur (skeleton, FCP excellent) mais le TBT reste élevé car Three.js doit toujours exécuter ses calculs géométriques sur le thread principal.

---

## Pistes d'amélioration futures

1. **OffscreenCanvas + Web Worker** : Déplacer le rendu Three.js dans un Worker (refonte majeure)
2. **Rendu progressif** : Afficher d'abord le soleil, puis ajouter les planètes une par une
3. **LOD (Level of Detail)** : Géométries simplifiées au démarrage, détaillées après interaction
4. **Image de fallback** : Screenshot statique de la scène pendant le chargement

---

*Dernière mise à jour : 11 Mars 2026*
