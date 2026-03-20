# Changelog — Améliorations performance depuis le dernier push

**Référence** : dernier push = `feat: bouton toggle pour desactiver les iframes YouTube` (commit 820e763).

Toutes les actions ci‑dessous ont été faites après ce push, sans nouveau commit. Ce document sert de base pour le prochain push.

---

## 1. Monitoring performance page Explore (3D)

### Fichiers modifiés / créés
- **Créé** : `frontend/src/hooks/useExplorePerformance.ts`
- **Modifié** : `frontend/src/app/(main)/explore/page.tsx`
- **Modifié** : `frontend/src/components/features/explore/canvas/ExploreScene.tsx`

### Actions
- Ajout d’un hook **`useExplorePerformance`** qui enregistre :
  - `pageLoadStart`, `canvasInitMs`, `firstFrameMs`, `sceneReadyMs`, `planetsLoadedMs`, `entryPhaseDoneMs`, `structureMs`, `trajectoryCpuMs`, FPS (avg/min/max), `frameCount`, `totalRenderTime`, `nodesApiMs`.
- Sur la page `/explore`, utilisation du hook avec `debug` en dev, `trackFps` sur 5 s.
- **ExploreScene** reçoit les callbacks : `onFirstFrame`, `onSceneReady`, `onPlanetsLoaded`, `onAllPlanetsOnOrbit`.
- Détection de la **première frame** via un composant `FirstFrameDetector` dans la scène (appel à `useFrame` une fois).
- Après ~5 s, affichage en console d’un **tableau** (`console.table`) avec toutes les métriques + sauvegarde dans `localStorage` (clé `explore_perf_metrics`).
- Correction d’un bug : **`onAllPlanetsOnOrbit`** ajouté à la déstructuration des props de `ExploreScene` pour éviter `ReferenceError: onAllPlanetsOnOrbit is not defined`.

---

## 2. Métrique « Toutes les planètes en orbite » et temps physique au démarrage

### Fichiers modifiés
- `frontend/src/hooks/useExplorePerformance.ts`
- `frontend/src/components/features/explore/canvas/ExploreScene.tsx`

### Actions
- **`markAllPlanetsOnOrbit()`** enregistre le temps (depuis page load) où la dernière planète finit son animation d’entrée.
- Dans **Planet**, ajout d’un callback **`onEnterOrbit`** appelé quand `tNorm >= 1` (planète arrivée sur l’orbite).
- Dans **SceneContent**, comptage des planètes ayant appelé `onEnterOrbit` ; quand le compte atteint `orbitNodes.length`, appel de **`onAllPlanetsOnOrbit()`**.
- Réinitialisation du compteur (et du flag) quand **`restartKey`** change.
- Log en dev : `[ExplorePerf] Phase d'entrée terminée — toutes les planètes en orbite en XXX ms`.

---

## 3. Détail des timings : Structure, Lumière, Trajectoires

### Fichiers modifiés
- `frontend/src/hooks/useExplorePerformance.ts`
- `frontend/src/components/features/explore/canvas/ExploreScene.tsx`

### Actions
- **Structure (canvas → 1ère frame)** : calculée comme `firstFrameMs - canvasInitMs` (et stockée dans `structureMs` lors de `markAllPlanetsOnOrbit`). Représente le temps de création du graphe de scène (orbites, soleil, planètes, meshes).
- **Lumière** : pas de métrique CPU dédiée ; le setup des lumières est inclus dans la même phase que la structure ; l’éclairage à l’écran est calculé côté GPU au premier frame. Une ligne **« Lumière (setup, inclus Structure) »** avec valeur `"incluse"` est ajoutée au tableau console.
- **Trajectoires (CPU cumulé)** :
  - Dans **Planet**, en phase d’entrée (`!s.hasEnteredOrbit`), mesure du temps CPU du bloc (easing, `getEntryPosition`, mise à jour position) via `performance.now()` avant/après.
  - Callback **`onTrajectoryFrame(cpuMs)`** appelé à chaque frame en phase d’entrée pour accumuler ce temps.
  - Dans **SceneContent**, une ref **`trajectoryCpuMsRef`** accumule ces appels ; à l’appel de **`onAllPlanetsOnOrbit(trajectoryCpuMsRef.current)`**, la valeur est passée au hook.
  - **`markAllPlanetsOnOrbit(trajectoryCpuMs?: number)`** enregistre `trajectoryCpuMs` dans les métriques et l’affiche dans le tableau et dans le log dev : `(CPU trajectoires: Y ms)`.
- Le tableau console affiche désormais : **Structure (canvas → 1ère frame)**, **Lumière (setup, inclus Structure)**, **Trajectoires (CPU cumulé)**, **Page Load → All planets on orbit**, plus les métriques déjà présentes.

---

## 4. Réduction du temps d’apparition des planètes

### Fichiers modifiés
- `frontend/src/contexts/PlanetsOptionsContext.tsx`

### Actions
- **Durée d’entrée par défaut** : `entryDuration` passée de **3,5 s** à **1,8 s** par planète.
- Les planètes arrivent plus vite sur leur orbite, ce qui réduit le temps perçu avant que la scène soit « complète ».

---

## 5. Marqueurs de performance YouTube (YT)

### Fichiers modifiés
- `frontend/src/components/features/explore/canvas/ExploreVideos.tsx`

### Actions
- **API YouTube** : marqueurs `yt-api-load-start` et `yt-api-ready` ; mesure **`yt-api-total`** ; log en dev `[YTPerf] YouTube Iframe API ready in XXX ms`.
- **Players** : pour chaque player (main, cycle, override), marqueurs `yt-player-<label>-init` et `yt-player-<label>-ready` ; mesure **`yt-player-<label>-from-api`** ; log en dev `[YTPerf] Player <label> ready in XXX ms`.
- Le hook **`useYTPlayer`** prend maintenant un 4ᵉ argument **`label`** (`"main"`, `"cycle"`, `"override"`).

---

## 6. Player YouTube « cycle » en différé

### Fichiers modifiés
- `frontend/src/components/features/explore/canvas/ExploreVideos.tsx`

### Actions
- État **`cyclePlayerAllowed`** : passé à `true` seulement **1,2 s après** que l’API YouTube soit prête.
- Le player **cycle** n’est créé qu’à ce moment‑là, pour éviter deux iframes lourds en même temps et réduire les creux de FPS au démarrage.

---

## 7. Documentation et explications

### Fichiers modifiés / créés
- **Créé** : `frontend/docs/CHANGELOG-PERF-DEPUIS-DERNIER-PUSH.md` (ce fichier).
- **Modifié** : `frontend/docs/PERF-AMELIORATIONS.md` (déjà à jour sur le raycaster, la phase d’entrée, la durée d’entrée réduite, le player cycle en différé, le récap actions).

### Actions
- **Raycaster** : commentaire dans `ExploreScene.tsx` et section dans `PERF-AMELIORATIONS.md` pour expliquer que le raycaster sert à la zone de survol (vitesse orbite/planète), pas aux clics.
- Récap des actions et des métriques dans `PERF-AMELIORATIONS.md`.

---

## Récapitulatif des fichiers impactés

| Fichier | Type |
|---------|------|
| `frontend/src/hooks/useExplorePerformance.ts` | Créé puis modifié (métriques, structure, trajectoires, markAllPlanetsOnOrbit avec arg) |
| `frontend/src/app/(main)/explore/page.tsx` | Modifié (hook perf, callbacks vers ExploreScene) |
| `frontend/src/components/features/explore/canvas/ExploreScene.tsx` | Modifié (FirstFrameDetector, onEnterOrbit, onAllPlanetsOnOrbit, onTrajectoryFrame, trajectoryCpuMsRef, destructuring onAllPlanetsOnOrbit, commentaire raycaster) |
| `frontend/src/contexts/PlanetsOptionsContext.tsx` | Modifié (entryDuration 3.5 → 1.8) |
| `frontend/src/components/features/explore/canvas/ExploreVideos.tsx` | Modifié (marqueurs YT, cyclePlayerAllowed + délai 1,2 s) |
| `frontend/docs/PERF-AMELIORATIONS.md` | Modifié (raycaster, phase d’entrée, durée réduite, récap) |
| `frontend/docs/CHANGELOG-PERF-DEPUIS-DERNIER-PUSH.md` | Créé (ce changelog) |

---

## Comment tester

1. Lancer le front en dev, aller sur **`/explore`**.
2. Ouvrir la **console** (F12).
3. Attendre ~5 s : le tableau de métriques s’affiche, avec notamment **Structure**, **Lumière**, **Trajectoires (CPU cumulé)**, **All planets on orbit**.
4. Vérifier les logs **`[ExplorePerf]`** et **`[YTPerf]`** (avec YouTube activé, pas de bouton 🚫 YT).
5. Optionnel : lire les dernières métriques avec `localStorage.getItem('explore_perf_metrics')`.

---

*Document généré pour documenter toutes les actions depuis le dernier push (bouton désactivation YouTube).*
