# Données démo — Site Bachata V5

**Objectif :** peupler la base avec des données de démonstration pour tester le front (Cours, Événements, Explore 3D).

---

## 1. Commandes

| Commande | Rôle |
|----------|------|
| `python manage.py load_initial_data` | Données de référence : Level, DanceStyle, MenuItem. **À exécuter en premier.** |
| `python manage.py load_demo_data` | Données démo : noeuds, cours, événements, NodeEvents. |

**Ordre :** depuis `backend/`, exécuter d'abord `load_initial_data`, puis `load_demo_data`.

---

## 2. Contenu créé par `load_demo_data`

### 2.1 Noeuds d'organisation (Explore 3D)

| Slug | Nom | Type | Description courte |
|------|-----|------|--------------------|
| `capital-of-fusion` | Capital of Fusion | ROOT | École nationale de danse — Bachata, Salsa, Kizomba. |
| `bachatavibe-paris` | BachataVibe Paris | BRANCH | Pôle Paris — cours et soirées. |
| `bachatavibe-lyon` | BachataVibe Lyon | BRANCH | Pôle Lyon. |

- Paris et Lyon sont **enfants** de Capital of Fusion.
- Champs 3D renseignés : `planet_color`, `orbit_radius`, `planet_scale`, `rotation_speed`, etc., pour affichage dans la scène Explore.

### 2.2 NodeEvents (overlay Explore)

- **BachataVibe Paris :** « Soirée Bachata mensuelle », « Stage weekend débutants ».
- **BachataVibe Lyon :** « Cours découverte ».

Dates calculées à partir de la date du jour (démo à J+7, J+14, J+21).

### 2.3 Cours

| Slug | Nom | Style | Niveau | Noeud |
|------|-----|-------|--------|-------|
| `bachata-debutant` | Bachata Débutant | Bachata | Débutant | BachataVibe Paris |
| `bachata-intermediaire` | Bachata Intermédiaire | Bachata | Intermédiaire | BachataVibe Paris |
| `salsa-debutant` | Salsa Débutant | Salsa | Débutant | BachataVibe Lyon |

Chaque cours a **un horaire récurrent** (lundi 19h–20h30, lieu « Studio Paris » ou « Studio Lyon »).

### 2.4 Événements

| Slug | Nom | Type | Lieu | Noeud |
|------|-----|------|------|-------|
| `festival-bachata-fusion` | Festival Bachata Fusion | FESTIVAL | Paris | BachataVibe Paris |
| `soiree-social-bachata` | Soirée Social Bachata | PARTY | Paris | BachataVibe Paris |
| `atelier-sensual` | Atelier Sensual | WORKSHOP | Lyon | BachataVibe Lyon |

- Dates : J+7, J+14, J+30 (à partir du jour du chargement).
- Chaque événement a un **Pass standard** (25 €, 50 places).

---

## 3. Idempotence

Les deux commandes utilisent `get_or_create` sur des clés naturelles (slug, etc.) : les relancer ne duplique pas les données. Pour repartir de zéro, supprimer les enregistrements concernés via l'admin Django ou une migration de données inverse.

---

## 4. Vérification

- **Front :** `/cours` → 3 cours ; `/evenements` → 3 événements ; `/explore` → 3 planètes, clic → overlay avec NodeEvents.
- **API :** `GET /api/courses/`, `GET /api/events/`, `GET /api/organization/nodes/` retournent les données démo.
- **Admin :** `http://localhost:8000/admin/` — consulter Core, Organization, Courses, Events.

---

*Dernière mise à jour : 2025-02-10*
