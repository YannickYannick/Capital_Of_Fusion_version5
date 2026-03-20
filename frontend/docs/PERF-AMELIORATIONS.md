# Améliorations performance (explore + YouTube)

## Raycaster (explore 3D)

Le **raycaster** dans `ExploreScene` est un rayon 3D tiré depuis la caméra vers la position de la souris. Il sert uniquement à savoir si le pointeur vise la **zone des orbites** (distance au centre, hauteur), pour adapter la vitesse de rotation :
- survol zone orbites → `hoverOrbitSpeedRatio`
- survol d’une planète → `hoverPlanetSpeedRatio`

Les **clics** sont gérés par React Three Fiber sur les meshes, pas par ce raycaster.

---

## Métrique « Phase d’entrée » (physique au démarrage)

Le temps jusqu’à **toutes les planètes en orbite** est mesuré et affiché dans le tableau de perf :
- **Page Load → All planets on orbit** = durée depuis le chargement de la page jusqu’à la fin de l’animation d’entrée de la dernière planète.
- Un log console en dev : `[ExplorePerf] Phase d'entrée terminée — toutes les planètes en orbite en XXX ms`.

---

# Améliorations passées (explore + YouTube)

## Métriques enregistrées (page /explore)

Le tableau en console inclut désormais :
- **Nodes API (GET /nodes/)** : temps de réponse de l’API `GET /api/organization/nodes/` en ms.
- **Page Load → All planets on orbit** : temps jusqu’à ce que toutes les planètes aient terminé leur animation d’entrée (phase physique au démarrage).

Pour mesurer manuellement en console (avec l’URL du backend, ex. port 8000) :
```js
const t0 = performance.now();
fetch('http://localhost:8000/api/organization/nodes/')
  .then(r => r.json())
  .then(d => console.log('Noeuds:', d.length, '| Temps:', (performance.now() - t0).toFixed(0), 'ms'))
  .catch(e => console.error(e));
```

---

## Ce qui a été fait dans le code

### 1. **Durée d’entrée des planètes réduite**
- Par défaut, la phase d’entrée (trajectoire jusqu’à l’orbite) est passée de **3,5 s** à **1,8 s** par planète.
- Les planètes apparaissent donc plus vite à l’écran. Tu peux la modifier dans le panneau Options 3D (« Durée entrée ») ou dans `PlanetsOptionsContext` (valeur par défaut).

### 2. **Player YouTube "cycle" en différé**
- Le player **main** se crée dès que l’API YouTube est prête.
- Le player **cycle** ne se crée qu’**1,2 s après** l’API, pour éviter deux iframes lourds en même temps.
- Effet attendu : moins de pics CPU, meilleur **Min FPS**, et temps "Player cycle ready" décalé.

---

## Ce que tu peux améliorer (résumé du rapport)

### 2. **Min FPS (7–8 fps)**
- Les creux viennent souvent de : création des iframes YouTube, GC, ou premier rendu 3D.
- **Déjà en place** : délai du player cycle ci‑dessus.
- **À faire** : avec l’onglet **Performance** de Chrome, enregistrer un chargement, zoomer sur les moments où le FPS chute et regarder dans **Bottom-up** / **Call tree** quel script ou tâche prend du temps.

### 3. **First Frame / Scene Ready (~2,1 s)**
- Réduire le bundle JS (code-splitting, lazy des écrans lourds), garder le délai avant de monter la scène 3D (déjà en place).
- Vérifier que les **images** (ex. logo) sont en taille raisonnable et en WebP si possible.

### 4. **Erreur `postMessage` cross-origin (YouTube)**
- Message : *"The target origin provided ('https://www.youtube.com') does not match the recipient window's origin ('http://localhost:3001')"*.
- Vient du **player YouTube** (iframe), pas de notre code (aucun `postMessage` dans le front).
- En **production** (même origine HTTPS), ça peut disparaître. En local, on ne peut pas corriger le comportement de l’iframe YouTube.

### 5. **"[Violation] non-passive event listener (touchstart)"**
- Vient très probablement de **OrbitControls** (Three.js / `@react-three/drei`), qui écoute le touch pour la rotation de la caméra.
- Pas d’`addEventListener('touchstart')` dans notre code.
- Pour l’instant : pas de correctif côté nous ; si besoin, ouvrir une issue ou PR sur `@react-three/drei` / three.js pour proposer `{ passive: true }` où c’est possible.

### 6. **Handlers longs (rAF 91 ms, setTimeout 87–89 ms, rIC 86 ms)**
- Souvent dus au **premier rendu 3D** ou à l’**init YouTube**.
- Le délai du player cycle (voir §1) aide à étaler l’init.
- Pour aller plus loin : alléger le premier frame 3D (moins d’objets visibles au démarrage, LOD, etc.) ou déplacer du travail hors du main thread si possible (très dépendant de Three/R3F).

### 7. **Google Ads bloqués (ERR_BLOCKED_BY_CLIENT)**
- Lié à un **bloqueur de pub** (ex. AdBlock). Pas un bug de l’app ; aucun changement à faire si tu ne dépends pas des ads.

---

## Récap actions

| Priorité | Action |
|----------|--------|
| ✅ Fait | Durée d’entrée planètes réduite (3,5 s → 1,8 s par défaut) |
| ✅ Fait | Métrique « All planets on orbit » (temps phase d’entrée) |
| ✅ Fait | Délai 1,2 s avant de créer le player YouTube "cycle" |
| À faire | Profiler les chutes de FPS (Performance > Bottom-up) |
| Optionnel | Vérifier taille/format des images (LCP) |
| Externe | postMessage : normal en local ; passive touchstart : dépendance drei/three |
