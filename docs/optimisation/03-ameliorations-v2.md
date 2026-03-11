# Améliorations V2 - Suppression Complète de framer-motion

## Date : Mars 2026

Ce document récapitule les optimisations V2 focalisées sur l'élimination totale de `framer-motion`.

---

## 1. Suppression de framer-motion de toute la codebase

### Problème
- `framer-motion` était encore présent dans plusieurs fichiers :
  - `/explore/page.tsx` et ses composants
  - `/organisation/noeuds/page.tsx` et `/organisation/noeuds/[slug]/page.tsx`
  - `/partenaires/structures/[slug]/page.tsx`
  - `/artistes/profils/[username]/page.tsx`

### Solution
Remplacement systématique par :
1. **`AnimatedDiv`** - composant CSS natif avec `IntersectionObserver`
2. **Animations CSS personnalisées** pour les entrées/sorties de modals

### Nouvelles animations CSS ajoutées

```typescript
// tailwind.config.ts
keyframes: {
  "fadeOut": { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
  "fadeOutScale": { "0%": { opacity: "1", transform: "scale(1)" }, "100%": { opacity: "0", transform: "scale(0.95)" } },
  "slideInRight": { "0%": { opacity: "0", transform: "translateX(300px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
  "slideOutRight": { "0%": { opacity: "1", transform: "translateX(0)" }, "100%": { opacity: "0", transform: "translateX(300px)" } },
  "slideInX": { "0%": { opacity: "0", transform: "translateX(20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
  "popIn": { "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.9)" }, "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" } },
  "popOut": { "0%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" }, "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.9)" } },
},
```

---

## 2. Migration des composants Explore

### `PlanetOverlay.tsx`

**Avant :**
```tsx
import { motion, AnimatePresence } from "framer-motion";
// ...
<AnimatePresence>
  {node && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // ...
    >
```

**Après :**
```tsx
// État pour gérer l'animation de sortie
const [isClosing, setIsClosing] = useState(false);

const handleClose = useCallback(() => {
  setIsClosing(true);
  setTimeout(() => onClose(), 300);
}, [onClose]);

// Classes CSS conditionnelles
<div className={`... ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}>
  <div className={`... ${isClosing ? "animate-fadeOutScale" : "animate-fadeInScale"}`}>
```

### `OptionsPanel.tsx`

**Avant :**
```tsx
<AnimatePresence>
  {visible && (
    <motion.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
```

**Après :**
```tsx
// Gestion du cycle de vie avec shouldRender
const [isClosing, setIsClosing] = useState(false);
const [shouldRender, setShouldRender] = useState(visible);

useEffect(() => {
  if (visible) {
    setShouldRender(true);
    setIsClosing(false);
  } else if (shouldRender) {
    setIsClosing(true);
    const timer = setTimeout(() => setShouldRender(false), 300);
    return () => clearTimeout(timer);
  }
}, [visible, shouldRender]);

// Rendu conditionnel avec animation
{shouldRender && (
  <aside className={`... ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"}`}>
```

### `GlobalPlanetConfigPanel.tsx`

Même pattern que `OptionsPanel` pour le panneau slide-in.

### `explore/page.tsx`

Remplacement de `AnimatePresence` + `motion.div` par un simple `div` avec classe `animate-fadeInScale`.

---

## 3. Migration des pages profil

### Pages migrées

| Page | Composants modifiés |
|------|---------------------|
| `/organisation/noeuds/page.tsx` | Hero, grid cards |
| `/organisation/noeuds/[slug]/page.tsx` | Hero, sections à propos, cartes cours/événements |
| `/partenaires/structures/[slug]/page.tsx` | Hero, sections à propos, cartes cours/événements |
| `/artistes/profils/[username]/page.tsx` | Hero, bio, carte détails |

### Pattern utilisé

```tsx
// Import
import { AnimatedDiv } from "@/components/shared/AnimatedDiv";

// Usage
<AnimatedDiv animation="fadeInUp">
  <h1>Contenu animé</h1>
</AnimatedDiv>

<AnimatedDiv animation="fadeIn" delay={0.1} className="...">
  <section>...</section>
</AnimatedDiv>
```

---

## 4. Impact sur les bundles

### Avant V2

| Page | First Load JS |
|------|---------------|
| `/explore` | ~162 KB |
| Pages avec framer-motion | ~147-150 KB |

### Après V2

| Page | First Load JS | Gain |
|------|---------------|------|
| `/explore` | ~109 KB | -53 KB |
| Toutes les pages | ~109 KB | -38-53 KB/page |

### Suppression complète

```bash
# framer-motion n'est plus dans le bundle
grep "framer-motion" - Aucun résultat
```

---

## 5. Avantages de la migration

1. **Taille de bundle réduite** : ~100 KB économisés sur framer-motion
2. **Performance** : Animations CSS GPU-accélérées nativement
3. **Maintenance** : Moins de dépendances à gérer
4. **Compatibilité** : Animations CSS supportées par tous les navigateurs modernes
5. **SSR** : Pas de problème d'hydratation avec les animations CSS

---

## 6. Limitations acceptées

- Pas d'`AnimatePresence` automatique (géré manuellement avec `isClosing` + `setTimeout`)
- Animations de sortie nécessitent un état local (`isClosing`)
- Moins de contrôle sur les courbes d'animation complexes (spring, etc.)

---

## 7. Fichiers modifiés

```
frontend/
├── tailwind.config.ts                    # Nouvelles keyframes
├── src/
│   ├── app/(main)/
│   │   ├── explore/page.tsx              # Suppression motion
│   │   ├── organisation/noeuds/
│   │   │   ├── page.tsx                  # AnimatedDiv
│   │   │   └── [slug]/page.tsx           # AnimatedDiv
│   │   ├── partenaires/structures/
│   │   │   └── [slug]/page.tsx           # AnimatedDiv
│   │   └── artistes/profils/
│   │       └── [username]/page.tsx       # AnimatedDiv
│   └── components/features/explore/components/
│       ├── PlanetOverlay.tsx             # CSS animations
│       ├── OptionsPanel.tsx              # CSS animations
│       └── GlobalPlanetConfigPanel.tsx   # CSS animations
```

---

## 8. Résultats Lighthouse Post-Optimisation

### Métriques `/explore` - Local (Mars 2026)

| Métrique | Avant V2 | Après V2 | Évolution |
|----------|----------|----------|-----------|
| **FCP** | 0.4s | 0.4s | = stable |
| **LCP** | 0.5s | 0.5s | = stable |
| **CLS** | ~0 | 0.002 | 🟢 excellent |
| **Speed Index** | 2.9s | 2.5s | 🟢 **-400ms** |
| **TBT** | 1,580ms | 1,530ms | 🟡 -50ms |
| **TTI** | 7.1s | 6.9s | 🟡 -200ms |
| **First Load JS** | 162 KB | 109 KB | 🟢 **-53 KB (-33%)** |

### Métriques `/explore` - Production (Vercel, Mars 2026)

| Métrique | Local | Production | Analyse |
|----------|-------|------------|---------|
| **FCP** | 0.4s | 0.9s | Latence réseau normale |
| **LCP** | 0.5s | 0.9s | Latence réseau normale |
| **CLS** | 0.002 | **0** | 🟢 Parfait |
| **Speed Index** | 2.5s | 5.1s | Latence réseau |
| **TBT** | 1,530ms | **380ms** | 🟢 **-75% en prod !** |
| **TTI** | 6.9s | **2.6s** | 🟢 **-62% en prod !** |

### Analyse

**Points forts :**
- **TBT de 380ms** : L'optimisation Vercel (minification, compression) réduit drastiquement le temps de blocage
- **TTI de 2.6s** : Page interactive en moins de 3 secondes
- **CLS parfait (0)** : Aucun décalage visuel
- Bundle JS réduit de 33% (-53 KB)

**Différences local/production :**
- FCP/LCP plus élevés en production à cause de la latence réseau (normal)
- TBT/TTI significativement meilleurs en production grâce aux optimisations Vercel :
  - Code minifié et compressé
  - Gzip/Brotli activé
  - Edge caching

**Points à améliorer (priorité réduite) :**
- TBT de 380ms reste un peu élevé (objectif < 200ms)
- Optimisations Three.js toujours pertinentes pour mobile

---

## 9. Conclusion V2

✅ **Objectif atteint** : Le site est maintenant performant en production avec :
- **TTI < 3s** (2.6s)
- **TBT acceptable** (380ms)
- **Stabilité visuelle parfaite** (CLS = 0)
- **Bundle réduit de 33%**

---

## 10. Prochaines optimisations suggérées (optionnelles)

### Priorité moyenne (si besoin mobile)
1. **Code splitting Three.js** - Lazy load des types de planètes individuellement
2. **Accessibilité** - 57 inputs sans labels, 1 bouton contraste insuffisant

### Priorité basse
3. **Optimisation images** - `logo.png` surdimensionné (23 KB récupérables)
4. **Meta description** - Manquante pour le SEO
5. **Font display** - Ajouter `font-display: swap` (270ms potentiels)
6. **CSS critique inline** - Réduire le render-blocking
7. **Préchargement chunks** - Hints pour les routes fréquentes

---

*Dernière mise à jour : 7 Mars 2026*
