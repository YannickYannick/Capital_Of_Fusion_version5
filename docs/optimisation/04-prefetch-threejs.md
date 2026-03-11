# Optimisation V3 - Prefetch Three.js et suppression framer-motion

## Date : 11 Mars 2026

Ce document récapitule les optimisations V3 focalisées sur le préchargement intelligent de Three.js.

---

## 1. Suppression définitive de framer-motion

### Modification
- Suppression de `framer-motion` du `package.json`
- La librairie était encore présente dans les dépendances mais plus utilisée dans le code

### Impact estimé
- **~100 KB** économisés sur le bundle final
- Réduction du temps de parsing JS

---

## 2. Prefetch de Three.js sur la page d'accueil

### Problème
- Three.js (~500 KB) était chargé uniquement lors de la navigation vers `/explore`
- Cela causait un **TBT élevé** (temps de blocage) lors du premier accès

### Solution
Création du hook `usePrefetchExplore` qui précharge les modules en arrière-plan :

```typescript
// frontend/src/hooks/usePrefetchExplore.ts
export function usePrefetchExplore(delayMs = 3000, enabled = true) {
  useEffect(() => {
    const prefetchModules = () => {
      import("three");
      import("@react-three/fiber");
      import("@react-three/drei");
      import("@/components/features/explore/canvas/ExploreScene");
      import("gsap");
    };

    const timer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(prefetchModules, { timeout: 5000 });
      } else {
        prefetchModules();
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, enabled]);
}
```

### Utilisation
```typescript
// frontend/src/app/(main)/LandingPageClient.tsx
usePrefetchExplore(3000); // Précharge après 3s sur la homepage
```

### Avantages
1. **requestIdleCallback** : Ne bloque pas le main thread
2. **Délai de 3s** : L'utilisateur a le temps de voir la page d'accueil
3. **Cache navigateur** : Les modules restent en cache pour les visites suivantes

---

## 3. Optimisation du chargement sur /explore

### Modifications
1. **Appels API parallélisés** avec `Promise.all`
2. **`startTransition`** pour ne pas bloquer les interactions
3. **`loading: () => null`** sur le dynamic import pour éviter le flash

```typescript
// Avant
getOrganizationNodes().then(setNodes);
getSiteConfig().then(config => setBatch(config));

// Après
Promise.all([getOrganizationNodes(), getSiteConfig()])
  .then(([nodes, config]) => {
    startTransition(() => {
      setNodes(nodes);
      setBatch(config.explore_config);
    });
  });
```

---

## 4. Pourquoi pas de Web Worker ?

Après analyse, un Web Worker n'est pas pertinent ici car :

1. **React Three Fiber utilise le DOM** : Les workers n'ont pas accès au DOM
2. **Les calculs sont déjà optimisés** : `useMemo` et `memo` sur tous les composants
3. **Le problème est le parsing JS** : Le prefetch résout ce problème plus efficacement

---

## 5. Fichiers modifiés

```
frontend/
├── package.json                           # Suppression framer-motion
├── src/
│   ├── hooks/
│   │   └── usePrefetchExplore.ts          # Nouveau hook de prefetch
│   └── app/(main)/
│       ├── LandingPageClient.tsx          # Utilisation du prefetch
│       └── explore/page.tsx               # API parallélisées + startTransition
```

---

## 6. Impact attendu

| Métrique | Avant | Après (estimé) |
|----------|-------|----------------|
| **TBT sur /explore** | 2,339ms | < 500ms |
| **TTI sur /explore** | 7.0s | < 3s |
| **Bundle framer-motion** | ~100 KB | 0 KB |
| **Expérience utilisateur** | Délai visible | Navigation fluide |

---

## 7. Comment tester

1. Ouvrir la page d'accueil
2. Attendre 3-5 secondes
3. Naviguer vers `/explore`
4. Observer que la page se charge plus rapidement

En mode développement, un log apparaît dans la console :
```
[Prefetch] Three.js et ExploreScene préchargés en arrière-plan
```

---

*Dernière mise à jour : 11 Mars 2026*
