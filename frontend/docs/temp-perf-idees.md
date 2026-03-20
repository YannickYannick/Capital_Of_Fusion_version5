### Vue d’ensemble

Tu as déjà des chiffres corrects (première frame ≈ 2,1s) mais on peut gratter. Les leviers sont surtout dans **ExploreScene.tsx** et les données.

### 1. Alléger ce qui est créé au tout début

- **Moins de planètes visibles au démarrage**  
  - Charger d’abord un **sous‑ensemble** (ex. 8–10 nœuds principaux), puis ajouter les autres après 1–2s avec un `setTimeout` / `startTransition`.
  - Ou afficher d’abord **seulement le soleil + 1er cercle**, puis les autres orbites.

- **Simplifier les géométries au boot**  
  - Baisser le nombre de segments (sphères, anneaux) pour les planètes de fond.
  - Réserver les planètes complexes (GLB, textures HD) aux nœuds survolés / sélectionnés.

- **Matériaux plus légers**  
  - Éviter les matériaux très chers (beaucoup de lights, effets complexes) sur toutes les planètes.
  - Garder un matériau simple par défaut, n’activer les effets "bling" qu’au survol / sélection.

### 2. Réduire le travail par frame

- **Limiter ce qui tourne dans `useFrame`**  
  - Aujourd’hui beaucoup de choses tournent à chaque frame (physique, raycaster, calculs d’orbite, oscillations…).  
  - Regrouper les calculs, réduire les `Math` lourds, éviter de recréer des objets (`new Vector3`) dans la boucle si possible.

- **Moins de raycasts / souris**  
  - Le raycaster tourne à chaque frame + 2 listeners `mousemove`.  
  - Tu peux:
    - mettre à jour la position de la souris moins souvent (throttle),
    - ou ne lancer certains calculs que si la souris est dans une zone d’intérêt (ex. proche du centre).

### 3. Découper l’animation d’entrée

- **Intro plus courte ou en "batches"**  
  - L’animation d’entrée des planètes (trajectoires fan/spirale) est très calculée.  
  - Options:
    - réduire la durée / complexité des trajectoires d’entrée,
    - faire entrer les planètes **par groupes** (batch de 5–10), pas toutes en même temps.

### 4. Profilage ciblé

Utilise l’onglet **Performance** :

- Enregistre un chargement `/explore`.
- Zoome sur la période 0–3s et regarde dans **Bottom‑up**:
  - quelles fonctions de `ExploreScene.tsx` prennent le plus de temps,
  - quelles parties de `useFrame` sont les plus coûteuses.
- On pourra ensuite optimiser précisément ces hot‑spots (je peux le faire si tu me donnes un screenshot du call tree).

---

Si tu veux qu’on passe à l’action, tu peux me dire :  
- tu préfères **moins de planètes au démarrage** ou **animations d’entrée plus simples** en premier ? Je peux alors modifier `ExploreScene.tsx` dans ce sens.
