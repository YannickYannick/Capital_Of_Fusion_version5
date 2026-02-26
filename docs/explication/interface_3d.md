# Documentation de l'Interface 3D (Explore)

Ce document décrit le fonctionnement, la configuration et la physique de l'interface 3D utilisée dans la section "Explore" (via `@react-three/fiber` et `three.js`).

## Architecture Générale
L'interface est structurée autour de **ExploreScene.tsx**, qui est le cœur de l'expérience, rendu dans un `<Canvas>` Three.js plein écran. Les paramètres globaux de la scène sont gérés via le `PlanetsOptionsContext`.

### Éclairage
L'éclairage est une combinaison "V4" optimisée pour mettre en valeur les planètes de différents types :
- **AmbientLight** : `intensité 0.6` pour déboucher les zones sombres.
- **DirectionalLight** : `intensité 2.0` avec ombre, depuis le haut-droite (`[10, 15, 10]`).
- **PointLights** : Un blanc brillant (`#ffffff`), un violet profond (`#7c3aed`) et un cyan (`#06b6d4`) pour créer des reflets modernes type "Synthwave/Sci-fi".

## Animation d'Entrée des Planètes (Entry Trajectory)

Lorsqu'une planète apparaît dans la scène 3D, elle ne se "téléporte" pas directement sur son orbite, ni ne se dirige vers le centre de celle-ci (ce qui la ferait traverser l'anneau orbital de l'extérieur vers l'intérieur). 

Le comportement physique est défini comme suit :
1. **Calcul du point le plus proche** : Au démarrage, la planète détermine sa position d'arrivée cible en cherchant le point de son orbite le plus proche de sa position de départ absolue (définie par `entryStartX`, `entryStartY`, `entryStartZ`).
2. **Déplacement en trajectoire directe** : La planète se dirige en ligne droite de sa coordonnée d'apparition jusqu'au point de contact identifié sur la bordure de l'orbite (matérialisé par une ligne pointillée `#a855f7`).
3. **Mise en rotation** : Dès qu'elle touche ce point (c'est-à-dire le premier contact avec l'orbite), elle s'y fixe de façon fluide (son angle/phase s'ajuste au point d'arrivée de façon transparente) et entame son cycle de rotation orbitale normal piloté par la vitesse `orbitSpeed` et le `orbit_phase`.

Ce mécanisme garantit qu'**aucune planète ne traverse l'anneau orbital** lors de son apparition sur l'écran.

## Formes des Orbites
Les planètes tournent autour d'un point central (Root) sur des orbites configurables :
- **Circle** : Orbite parfaitement circulaire (comportement cosmique standard).
- **Squircle** : Forme hybride entre carré et cercle, avec un paramètre `roundness` pour adoucir ou durcir les bords.
Les orbites sont matérialisées visuellement si `showOrbits` est activé.

## Modèles et Types de Planètes
Le composant `Planet` agit comme un proxy universel (physique + entrée) mais gère plusieurs rendus via `visual_source` et `planet_type` :

### Source de rendu (`visual_source`)
- `glb` : Si renseignée avec un URL valide, charge un modèle 3D animé.
- `gif`/`preset` : Utilise les presets locaux suivants.

### Types de Planètes (`planet_type`)
- **Glass (défaut)** : Sphère semi-transparente gérant les reflets, type verre.
- **Wire** : Icosaèdre en fil de fer.
- **Dotted** : Nuage sphérique de petits points 3D.
- **Chrome** : Sphère métallique rugueuse avec un haut taux de réflexion.
- **Network** : Structure réseau aléatoire avec des liens tracés entre les nœuds proches.
- **Star** : Icosaèdre couplé à des particules satellisées autour pour un effet d'étoile.

Chaque planète est surmontée d'un **Label** qui s'affiche au survol (hover) ou lorsqu'elle est sélectionnée. Dès que la souris passe sur une planète, ou si elle est sélectionnée, un "Glow" ou halo s'affiche autour, et sa taille augmente de 15%.

## Le Soleil Central (Root)
Le nœud central (`type === "ROOT"`) bénéficie d'un composant exclusif `Sun`. 
Contrairement aux planètes, sa position est fixée à `[0,0,0]` et il possède son propre cycle de rotation sur lui même. Il émet un halo lumineux constant et sa texture génère une luminescence (par le paramètre `emissive`).

## Physique Interactive
Le flux d'une planète s'articule autour de trois forces principales additionnées pendant le `useFrame` :
1. **Force de Retour (Spring)** : Une force de rappel constante pousse la planète vers sa position théorique sur l'orbite. Cette force est définie par `returnForce`.
2. **Répulsion de la Souris** : Un système interactif par "Raycaster" suit la souris sur un plan `Y=0`. Si la souris s'approche à moins de 5 unités, elle applique une force d'éloignement à la planète (`mouseForce`), poussant la sphère en dehors de sa trajectoire.
3. **Force de Collision** : Les planètes s'évitent entre elles. Si la distance entre deux planètes descend sous un certain palier basé sur leur taille (`scale`), elles se repoussent l'une l'autre selon une force de collision (`collisionForce`).

Le mouvement est finalement adouci via une force de friction globale, contrôlée par `damping`.

## Navigation et Caméra
La caméra principale se comporte de deux manières distinctes, utilisant la bibliothèque **GSAP** pour des transitions douces :

1. **Caméra Libre** (`OrbitControls` de Drei)
   L'utilisateur peut zoomer et faire un panorama autour de la scène 3D. Ses positions sont sauvegardées automatiquement dans le localStorage (`explore_camera_pos` et `explore_camera_target`) pour être restaurées en cas de rechargement.
2. **Zoom sur Sélection (CameraController)**
   Au premier clic sur une planète, la scène se met en pause (`freezePlanets`) puis la caméra anime sa position pour plonger vers les coordonnées X/Y/Z de la planète cliquée, s'arrêtant à une distance calculée à partir du `selectedScale`. 
3. **Le Reset**
   Lors d'un clic dans le vide stellaire, ou par déclenchement manuel, la caméra retrouve sa position enregistrée par défaut et l'animation des planètes (ainsi que la sélection) est réinitialisée.

De plus, l'angle de vision horizontal complet peut se régler en simulant un effet FishEye avec le paramètre `fishEye`.
