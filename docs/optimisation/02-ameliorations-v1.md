# Améliorations V1 - Optimisations Effectuées

## Date : Mars 2026

Ce document récapitule les optimisations déjà implémentées dans la V1.

---

## 1. Remplacement de framer-motion par CSS

### Problème
- `framer-motion` ajoutait ~38-39 KB au First Load JS de chaque page l'utilisant
- Utilisé pour des animations simples (fade, scale, slideUp)

### Solution
Création d'un composant léger `AnimatedDiv` utilisant :
- CSS `@keyframes` natifs
- `IntersectionObserver` pour le déclenchement `whileInView`

### Fichiers modifiés

**Nouveau composant** : `frontend/src/components/shared/AnimatedDiv.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export function AnimatedDiv({
  children,
  className = "",
  delay = 0,
  animation = "fadeIn",
  once = true,
  style,
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) observer.unobserve(ref.current);
        } else if (!once) setIsVisible(false);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once]);

  const animationClass = isVisible ? `animate-${animation}` : "opacity-0";
  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${delay}s`, animationFillMode: "both", ...style }}
    >
      {children}
    </div>
  );
}
```

**Keyframes ajoutés** dans `tailwind.config.ts` :

```ts
keyframes: {
  "progress-full": { "0%": { width: "0%" }, "100%": { width: "100%" } },
  "fadeIn": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
  "fadeInUp": { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
  "fadeInScale": { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { transform: "scale(1)" } },
},
animation: {
  "progress-full": "progress-full 1.5s linear forwards",
  "fadeIn": "fadeIn 0.5s ease-out forwards",
  "fadeInUp": "fadeInUp 0.5s ease-out forwards",
  "fadeInScale": "fadeInScale 0.5s ease-out forwards",
},
```

### Pages migrées

| Page | Avant | Après | Gain |
|------|-------|-------|------|
| `/care` | 147 KB | 109 KB | -38 KB |
| `/artistes` | 148 KB | 109 KB | -39 KB |
| `/fichiers` | 147 KB | 109 KB | -38 KB |
| `/organisation/poles` | 147 KB | 109 KB | -38 KB |
| `/organisation/staff` | 147 KB | 109 KB | -38 KB |
| `/partenaires/structures` | 147 KB | 109 KB | -38 KB |

### Impact
- **Réduction totale** : ~230 KB économisés sur 6 pages
- **First Load JS** : Aligné sur ~109 KB (base Next.js)

---

## 2. Différé du chargement YouTube API

### Problème
- L'API YouTube IFrame était chargée immédiatement au mount
- Bloquait le thread principal pendant ~549ms par iframe

### Solution
Différer le chargement de 1.5s après le FCP avec `requestIdleCallback`

### Fichier modifié : `ExploreVideos.tsx`

```tsx
// Chargement différé de l'API YouTube
useEffect(() => {
  const DEFER_YT_MS = 1500;

  const loadYT = () => {
    // ... logique de chargement
  };

  let cleanupInterval: (() => void) | undefined;
  const deferTimer = setTimeout(() => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        cleanupInterval = loadYT();
      });
    } else {
      cleanupInterval = loadYT();
    }
  }, DEFER_YT_MS);

  return () => {
    clearTimeout(deferTimer);
    cleanupInterval?.();
  };
}, [mainType, cycleType]);
```

### Impact
- **FCP amélioré** : Le contenu critique s'affiche avant le chargement vidéo
- **Thread principal libéré** : Pendant les 1.5 premières secondes

---

## 3. Différé du VideoBackgroundClient sur Homepage

### Problème
- `GlobalVideoBackground` montait immédiatement sur `/`
- Ajoutait du travail JS au chargement initial

### Solution
Différer le mount de 400ms sur la homepage

### Fichier modifié : `VideoBackgroundClient.tsx`

```tsx
const DEFER_HOME_MS = 400;

export function VideoBackgroundClient({ config }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [ready, setReady] = useState(() => !isHome);

  useEffect(() => {
    if (!isHome) {
      setReady(true);
      return;
    }
    const t = setTimeout(() => setReady(true), DEFER_HOME_MS);
    return () => clearTimeout(t);
  }, [isHome]);

  if (!ready) return null;
  return <GlobalVideoBackground config={config} />;
}
```

### Impact
- **Homepage plus fluide** : Contenu textuel affiché avant la vidéo

---

## 4. Mémoisation des composants Three.js

### Problème
- Les sous-composants planètes se re-rendaient à chaque frame
- Causait du travail JS inutile

### Solution
Wrapper les composants de rendu avec `React.memo`

### Fichier modifié : `ExploreScene.tsx`

```tsx
import { memo } from "react";

const OrbitRing = memo(function OrbitRing({ radius, shape, roundness, orbitY }) {
  // ...
});

const WirePlanet = memo(function WirePlanet({ scale, color }) {
  // ...
});

const DottedPlanet = memo(function DottedPlanet({ scale }) {
  // ...
});

const GlassPlanet = memo(function GlassPlanet({ scale, color }) {
  // ...
});

const ChromePlanet = memo(function ChromePlanet({ scale }) {
  // ...
});

const NetworkPlanet = memo(function NetworkPlanet({ scale, color }) {
  // ...
});

const StarPlanet = memo(function StarPlanet({ scale, color }) {
  // ...
});

const GlbPlanet = memo(function GlbPlanet({ url, scale }) {
  // ...
});
```

### Impact
- **Réduction des re-renders** : Seules les props modifiées déclenchent un update
- **Scripting time réduit** : Moins de travail par frame d'animation

---

## 5. Désactivation du prefetch sur /projets

### Problème
- Next.js prefetch chargeait le JS de `/projets` en background
- Causait des appels API 404 (endpoint non configuré)

### Solution
Ajouter `prefetch={false}` aux liens vers `/projets`

### Fichiers modifiés

**`Navbar.tsx`** et **`MobileNav.tsx`** :

```tsx
<Link
  href={url}
  prefetch={!url.startsWith("/projets")}
  // ...
>
```

### Impact
- **Moins de requêtes réseau** : Pas de prefetch inutile
- **Pas d'erreurs 404** : API non appelée avant navigation

---

## 6. API Projects rendue résiliente

### Problème
- Les appels à `/api/projects/` échouaient en 404
- Bloquait le rendu des pages

### Solution
Retourner un tableau vide sur 404

### Fichier modifié : `api.ts`

```tsx
export async function getProjectCategories(): Promise<ProjectCategoryApi[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/projects/categories/`);
  if (res.status === 404) return []; // Résilience
  if (!res.ok) throw new Error(`Project Categories API error: ${res.status}`);
  return res.json();
}
```

---

## Résumé des Gains V1

| Optimisation | Impact |
|--------------|--------|
| Remplacement framer-motion | -38 KB/page (6 pages) |
| Différé YouTube API | FCP amélioré |
| Différé VideoBackground | Homepage plus fluide |
| Mémoisation Three.js | Moins de scripting |
| Désactivation prefetch | Moins de requêtes |
| API résiliente | Pas de blocage |

---

## Prochaines Étapes (V2)

1. **Lazy loading de ExploreScene** sur `/explore` uniquement
2. **Code splitting** des composants Three.js
3. **Optimisation CSS critique** (inline ou preload)
4. **Analyse bundle** avec `@next/bundle-analyzer`

---

*Document généré automatiquement - Mars 2026*
