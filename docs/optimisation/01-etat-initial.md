# État Initial - Performance du Site Bachata V5

## Date de référence : Mars 2026

Ce document capture l'état initial des performances avant les optimisations majeures.

---

## Métriques Lighthouse - Page `/explore`

### Mode Normal (avec extensions Chrome)

| Métrique | Valeur | Évaluation |
|----------|--------|------------|
| **Performance Score** | 51/100 | 🔴 Faible |
| **FCP** (First Contentful Paint) | 0.9s | 🟢 Bon |
| **LCP** (Largest Contentful Paint) | 2.0s | 🟡 Moyen |
| **Speed Index** | 4.0s | 🔴 Mauvais |
| **TBT** (Total Blocking Time) | 2,260ms | 🔴 Très mauvais |
| **Max Potential FID** | 820ms | 🔴 Très mauvais |
| **TTI** (Time to Interactive) | 8.5s | 🔴 Très mauvais |

### Mode Incognito (sans extensions)

| Métrique | Valeur | Évaluation |
|----------|--------|------------|
| **Performance Score** | 63/100 | 🟡 Moyen |
| **FCP** | 0.4s | 🟢 Excellent |
| **LCP** | 0.5s | 🟢 Excellent |
| **Speed Index** | 2.9s | 🟡 Moyen |
| **TBT** | 1,580ms | 🔴 Très mauvais |
| **Max Potential FID** | 770ms | 🔴 Très mauvais |
| **TTI** | 7.1s | 🔴 Très mauvais |

---

## Analyse du Thread Principal

### Temps de travail (mode normal)

| Type | Durée | % du total |
|------|-------|------------|
| Script Evaluation | 2.9s | 56% |
| Script Parsing & Compilation | 1.4s | 27% |
| Rendering | ~0.5s | 10% |
| Autres | ~0.4s | 7% |
| **Total** | **5.2s** | 100% |

### Fichiers JavaScript les plus coûteux

| Fichier | Temps CPU Total | Temps Scripting |
|---------|-----------------|-----------------|
| `ExploreScene.tsx.js` | 820ms | 484.8ms |
| `webpack.js` | 404.8ms | 384.2ms |
| `main-app.js` | 767ms | 550ms |

---

## Taille des Bundles

### Charge réseau totale : 6.8 MB

| Fichier | Taille |
|---------|--------|
| `ExploreScene.tsx.js` | 2.4 MB |
| `main-app.js` | 1.7 MB |
| Autres | ~2.7 MB |

### First Load JS par page

| Page | First Load JS |
|------|---------------|
| `/explore` | 162 KB |
| `/` (homepage) | 109 KB |
| Pages avec `framer-motion` | ~147-150 KB |

---

## Ressources Bloquantes

| Ressource | Taille | Durée |
|-----------|--------|-------|
| `app/layout.css` | 13.7 KB | 51ms |

---

## Goulots d'Étranglement Identifiés

### 1. JavaScript Execution Time
- **Problème** : 4.2s de temps JS perdu
- **Cause principale** : `ExploreScene.tsx` (scène Three.js de 1700+ lignes)
- **Impact** : TBT et TTI très élevés

### 2. Bundle Size
- **Problème** : 6.8 MB de payload réseau
- **Cause** : Three.js + GSAP + framer-motion non optimisés
- **Impact** : Temps de chargement initial

### 3. framer-motion (avant optimisation)
- **Problème** : ~38-39 KB ajoutés par page
- **Cause** : Animations simples utilisant une bibliothèque lourde
- **Impact** : First Load JS excessif

### 4. YouTube Iframes
- **Problème** : ~549ms de HTML parsing par iframe
- **Cause** : 2 iframes YouTube chargés immédiatement
- **Impact** : Bloque le thread principal

### 5. CSS/JS Inutilisés
- **Problème** : ~150 KB JS + ~10 KB CSS récupérables
- **Cause** : Code non utilisé inclus dans les bundles
- **Impact** : Payload inutile

---

## Structure du Fichier ExploreScene.tsx

Le fichier principal de la scène 3D contient :

```
ExploreScene.tsx (1707 lignes)
├── Helpers (fonctions utilitaires)
│   ├── hexToColor()
│   ├── getSquirclePosition()
│   ├── getOrbitPosition()
│   └── getDynamicOrbitParams()
├── Trajectoires d'entrée
│   ├── getOrbitTangent()
│   ├── applyEasing()
│   └── getEntryPosition()
├── Composants géométriques (memoizés)
│   ├── OrbitRing
│   ├── WirePlanet
│   ├── DottedPlanet
│   ├── GlassPlanet
│   ├── ChromePlanet
│   ├── NetworkPlanet
│   ├── StarPlanet
│   └── GlbPlanet
├── Composant Planet (principal)
├── LabelSprite (billboard)
├── Sun (nœud ROOT)
├── CameraController (GSAP)
├── SceneContent (intérieur Canvas)
└── ExploreScene (export principal)
```

---

## Dépendances Lourdes

| Dépendance | Utilisation | Taille estimée |
|------------|-------------|----------------|
| `three` | Scène 3D | ~500 KB |
| `@react-three/fiber` | React bindings Three.js | ~100 KB |
| `@react-three/drei` | Helpers Three.js | ~150 KB |
| `gsap` | Animations caméra | ~60 KB |
| `framer-motion` | Animations UI | ~100 KB |
| `three/examples/jsm/loaders/GLTFLoader` | Modèles 3D | ~50 KB |

---

## Problèmes d'Accessibilité Détectés

1. **Contraste insuffisant** : 1 bouton avec couleur de texte trop claire
2. **Formulaires sans labels** : Plusieurs éléments `<input>` sans `<label>` associé

---

## Recommandations Prioritaires

1. **Lazy loading de ExploreScene** - Charger uniquement sur `/explore`
2. **Code splitting Three.js** - Séparer les composants planètes
3. **Remplacer framer-motion** - CSS animations pour les cas simples ✅ FAIT
4. **Différer YouTube API** - Charger après FCP ✅ FAIT
5. **Mémoiser composants Three.js** - Éviter re-renders ✅ FAIT
6. **Optimiser CSS critique** - Inline ou preload

---

*Document généré automatiquement - Mars 2026*
