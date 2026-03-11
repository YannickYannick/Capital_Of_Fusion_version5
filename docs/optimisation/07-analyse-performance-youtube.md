# Phase 7 — Analyse performance YouTube & plan d'optimisation

**Date** : Mars 2026

## Contexte

Analyse des performances de la page `/trainings` (et autres pages) suite à un rapport Lighthouse montrant un chargement lent.

---

## 1. Diagnostic

### 1.1 Architecture actuelle

Le composant `VideoBackgroundClient` est chargé dans le **layout principal** (`app/(main)/layout.tsx`) :

```
layout.tsx
├── AuthProvider
├── PlanetsOptionsProvider
├── PlanetMusicOverrideProvider
├── Navbar
├── VideoBackgroundClient ← Charge YouTube iframe
└── MainContent (children)
```

### 1.2 Vidéos YouTube utilisées

| Vidéo | Variable env | ID par défaut | Usage |
|-------|--------------|---------------|-------|
| **Main** | `NEXT_PUBLIC_YOUTUBE_VIDEO_ID` | `jfKfPfyJRdk` | Homepage (`/`) |
| **Cycle** | `NEXT_PUBLIC_YOUTUBE_CYCLE_VIDEO_ID` | `eZhq_RMYRKQ` | Toutes les autres pages |

### 1.3 Problème identifié

Le composant `ExploreVideos.tsx` crée **3 players YouTube** potentiels :
1. `mainYT` — vidéo principale
2. `cycleYT` — vidéo cycle
3. `overrideYT` — musique planète (si active)

L'API YouTube iframe se charge après un délai de **1.5 secondes** (`DEFER_YT_MS = 1500`), mais impacte quand même :
- **Temps de parsing JS** (~200-400ms)
- **Requêtes réseau** vers YouTube
- **Main thread blocking**

### 1.4 Ce qui fonctionne déjà

- Le player YouTube est **partagé entre les pages** (layout conservé par Next.js App Router)
- L'API YouTube est **mise en cache** par le navigateur après le 1er chargement
- Un délai de **400ms** sur la homepage avant de monter le composant vidéo

---

## 2. Options d'optimisation proposées

### Option A : Délai progressif selon la page (Facile)

**Principe** : Charger YouTube plus tard sur les pages secondaires.

| Page | Délai actuel | Nouveau délai |
|------|-------------|---------------|
| Homepage (`/`) | 400ms | 0ms (prioritaire) |
| Explore (`/explore`) | 0ms | 500ms |
| Autres pages | 0ms | **2500ms** |

**Impact estimé** : FCP amélioré de ~1-2s sur les pages secondaires

### Option B : Intersection Observer (Moyen)

**Principe** : Ne charger YouTube que si l'utilisateur reste sur la page > 3 secondes OU scrolle.

**Avantages** : Pas de chargement inutile si l'utilisateur quitte rapidement

### Option C : Vidéo MP4 placeholder (Recommandé)

**Principe** :
1. Afficher immédiatement une **vidéo MP4 courte** (5-10s loop, ~2-5MB)
2. Charger YouTube en arrière-plan
3. Transition fondu vers YouTube quand prêt

```
Temps 0ms      → MP4 locale démarre
Temps ~2000ms  → YouTube prêt
Temps ~2500ms  → Fondu : MP4 → YouTube
```

**Avantages** :
- FCP excellent (vidéo locale instantanée)
- Pas de fond noir visible
- Meilleure UX

**Fichier MP4 recommandé** :
- Extrait de 5-10s de la vidéo YouTube
- Compressé (~2-5MB)
- Loop seamless

### Option D : Service Worker + Cache API (Avancé)

**Principe** : Mettre en cache l'API YouTube iframe via Service Worker.

**Avantages** : Chargement instantané dès la 2ème visite

---

## 3. Recommandation

### Solution combinée A + C

1. **Délai progressif** (Option A) — rapide à implémenter
2. **Vidéo MP4 placeholder** (Option C) — meilleure UX

### Implémentation suggérée

```tsx
// VideoBackgroundClient.tsx
const DEFER_MS = {
  "/": 0,           // Homepage : prioritaire
  "/explore": 500,  // Explore : léger délai
  default: 2500,    // Autres : délai important
};

// Avec MP4 placeholder
const [ytReady, setYtReady] = useState(false);

return (
  <>
    {/* MP4 placeholder visible tant que YouTube n'est pas prêt */}
    <video 
      src="/videos/placeholder-loop.mp4"
      style={{ opacity: ytReady ? 0 : 1 }}
      autoPlay loop muted
    />
    
    {/* YouTube player (opacity 0 → 1 quand prêt) */}
    <div style={{ opacity: ytReady ? 1 : 0 }}>
      {/* YouTube iframe */}
    </div>
  </>
);
```

---

## 4. Métriques avant/après (attendues)

| Métrique | Avant | Après (estimé) |
|----------|-------|----------------|
| FCP | ~1.5s | ~0.5s |
| LCP | ~2.5s | ~1.0s |
| TBT | ~400ms | ~200ms |
| Speed Index | ~2.8s | ~1.2s |

---

## 5. Prochaines étapes

1. [ ] Implémenter Option A (délai progressif)
2. [ ] Créer/obtenir un fichier MP4 placeholder
3. [ ] Implémenter Option C (MP4 + transition)
4. [ ] Mesurer les performances avec Lighthouse
5. [ ] Optimiser si nécessaire
