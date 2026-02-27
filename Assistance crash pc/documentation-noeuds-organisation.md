# Documentation : Noeuds d'Organisation et Configuration 3D (V4 vs V5)

## 1. Hiérarchie des Noeuds Insérés (Projet V5)

Nous avons inséré dans la base de données (table `OrganizationNode`) la hiérarchie suivante. Les éléments marqués de ⭐ (Fiches détaillées) ont été créés avec des descriptions par défaut, prêtes à être complétées via l'interface d'administration.

```text
🌍 CAPITAL OF FUSION FRANCE (Racine / ROOT)
│
├── 🌟 BRANCHES OFFICIELLES (Branche / BRANCH)
│   │
│   ├── 💃 BACHATA VIBE (Branche / BRANCH)
│   │   ├── Bachata Vibe Experience (Événement / EVENT) ⭐
│   │   ├── Bachata Vibe Paris Hebdo (Événement / EVENT) ⭐
│   │   ├── Dominican Vibe (Événement / EVENT) ⭐
│   │   │
│   │   ├── 🎉 Paris Bachata Festival (Événement / EVENT)
│   │   │   ├── Jack n' Jill Vibe (Événement / EVENT)
│   │   │   ├── Street Battle (Événement / EVENT)
│   │   │   ├── Social World Cup (Événement / EVENT)
│   │   │   └── Experience Palmeraie (Événement / EVENT)
│   │   │
│   │   └── Bachata Vibe Lyon (Événement / EVENT) ⭐
│   │
│   ├── 🎶 KOMPA VIBE (Branche / BRANCH)
│   │   └── Kompa Vibe Paris (Événement / EVENT) ⭐
│   │
│   └── 🔥 AMAPIANO VIBE (Branche / BRANCH)
│       └── Amapiano Vibe Paris (Événement / EVENT) ⭐
```

## 2. Configuration des Planètes dans la V4

Vous m'avez interrogé sur la page d'administration V4 (ex: `http://localhost:8000/admin/organization/organizationnode/.../change/`). Voici exactement comment étaient structurés et configurés les noeuds (et donc les planètes) dans le panneau d'administration de la **V4** :

L'interface d'édition d'une planète (Noeud d'organisation) était divisée en 5 grandes sections (Fieldsets) :

### A. Informations de base
*   `name` : Nom du noeud (ex: "BACHATA VIBE").
*   `slug` : Identifiant URL.
*   `parent` : Noeud parent (pour définir la hiérarchie et les orbites mutuelles).
*   `type` : Type de noeud (`Root`, `Branch`, `Event`).
*   `description` : Description générale.

### B. Contenu de l'Overlay (Affiché au clic sur la planète)
*   `cover_image` : Image de couverture (16:9 recommandé).
*   `short_description` : Accroche courte (max 300 caractères).
*   `content` : Texte riche détaillé (supportant le Markdown).
*   `cta_text` et `cta_url` : Bouton d'action (ex: "En savoir plus" pointant vers `/cours`).

### C. Configuration 3D (Les paramètres visuels dans `/explore`)
C'est ici que l'aspect visuel de la planète dans la scène THREE.js était défini.
*   `is_visible_3d` : Interrupteur pour afficher ou cacher la planète dans la scène.
*   `visual_source` : Source du visuel (`preset` / `glb` / `gif`).
*   `planet_type` : Type de rendu si `preset` est choisi (`wire`, `dotted`, `glass`, `chrome`, `network`, `starburst`).
*   `model_3d` / `planet_texture` : Fichiers GLB ou Textures importées, selon le choix de la source visuelle.
*   `planet_color` : Couleur de base de la planète (Hexadécimal, ex: `#7c3aed`).
*   `planet_scale` : Taille de la planète (défaut : 0.8).
*   **Cinématique orbitale** :
    *   `orbit_radius` : Distance de la planète par rapport à son centre de rotation (défaut: 5.0).
    *   `orbit_speed` : Vitesse de parcours de l'orbite (défaut: 0.15).
    *   `rotation_speed` : Vitesse de rotation de la planète sur elle-même (défaut: 1.0).
    *   `orbit_phase` : Position de départ sur l'orbite, en radians (défaut: 0.0).
*   **Forme de l'orbite** :
    *   `orbit_shape` : `circle` (Circulaire) ou `squircle` (Carré arrondi).
    *   `orbit_roundness` : Si Squircle, valeur entre 0 (Carré) et 1 (Cercle).

### D. Animation d'Entrée
Gestion de la trajectoire fluide de la caméra (ou de la planète) au chargement.
*   `entry_start_x`, `entry_start_y`, `entry_start_z` : Coordonnées de départ exactes de la ligne d'entrée de la planète avant qu'elle ne rejoigne son orbite.
*   `entry_speed` : Vitesse de cette phase d'entrée (défaut: 0.4).

### E. Médias
*   `video_url` : URL d'une vidéo affichée potentiellement en fond d'overlay.

### Remarques pour la migration vers V5
La structure de base du modèle `OrganizationNode` dans la V5 a été copiée pour correspondre exactement à celle de la V4. Les mêmes champs de configuration orbitale et d'entrée sont présents dans le backend V5. Vous pouvez donc reconfigurer les planètes avec les mêmes valeurs ou importer un dump de données de la V4 pour récupérer les configurations visuelles exactes.

## 3. Résumé des Correctifs 3D apportés (V5)

Pour garantir le fonctionnement de l'interface d'Exploration 3D comme sur la V4, les actions suivantes ont été réalisées côté backend/frontend sur la V5 (le 26 février 2026) :

* **Insertion des noeuds Django** : Création algorithmique (`insert_hierarchy.py`) de la structure des planètes de la V4 dans la base V5.
* **Mise à jour du Modèle `OrganizationNode` et de l'Admin** : Migration complète des champs 3D (orbite, apparence, médias, trajectoire d'entrée) et reproduction de l'interface `admin.py` par sections (`fieldsets`) identiques à la V4.
* **Correction des Planètes Filaire ("Wireframe")** : Ajout d'une géométrie `sphereGeometry(16,16)` plus propre et désactivation du cache (`no-store`) côté Next.js pour prendre en compte les changements faits dans le back-office instantanément.
* **Correction du chargement GLB** : 
  * Ajout des directives `MEDIA_URL` et `MEDIA_ROOT` au `settings.py` (associé au support statique dans `urls.py`) pour que Django délivre localement les fichiers modèles.
  * Passage du contexte de requête HTTP (`context={'request': request}`) dans le serializer de `OrganizationNode` pour transformer les URLs relatives des GLB en URLs absolues (ex: `http://localhost:8000/media/...`).
  * Importation du dossier `media` depuis la V4 vers la V5 pour récupérer tous les fichiers GLB existants.
* **Fonctions de Répartition et de Dimension** :
  * Ajout d'une option de **Répartition Automatique des Orbites** pour recalculer les distances au soleil harmonieusement (sans toucher la base de données).
  * Ajout d'une gestion complète de **Dimension Verticale** (`orbit_position_y` en base) avec plusieurs modes (Manuel, Homogène, Jupiter) permettant d'éclater l'affichage sur la hauteur de façon réaliste.
  * Création d'un coefficient global (`Échelle Planètes`) pour réduire ou agrandir l'ensemble des planètes d'un coup.
* **Nouvelles intéractions de survol et de clic** :
  * Réduction globale de la vitesse de la scène via configuration (Options) avec **calcul par Raycasting 3D** si le pointeur survole le volume vertical des orbites.
  * **Double-clic vs Simple clic** : Contrairement à la V4 où il n'y avait qu'une seule action (ouvrir le panneau latéral sans ajuster la caméra), la V5 distingue le simple clic (zoom en douceur et centrage de la caméra sur la planète visée) et le double-clic (redirection native vers la section de la planète, en exploitant éventuellement son URL via `cta_url` ou son `slug`).
