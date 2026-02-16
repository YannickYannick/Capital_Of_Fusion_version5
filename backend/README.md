# Backend — Bachata V5 (Django + DRF)

Phase 1 : Django 5, DRF, SQLite, apps core / users / organization / courses / events.

## Environnement

- Python 3.10+
- Virtualenv recommandé : `python -m venv .venv` puis `.venv\Scripts\activate` (Windows) ou `source .venv/bin/activate` (Linux/Mac).
- Installer les dépendances : `pip install -r requirements.txt`

## Lancer le serveur

```bash
# Depuis backend/
python manage.py runserver
# ou avec module settings explicite
set DJANGO_SETTINGS_MODULE=config.settings.local
python manage.py runserver
```

Par défaut : `http://127.0.0.1:8000/`. Admin : `http://127.0.0.1:8000/admin/`.

## Données initiales

Après les migrations, charger les données de référence (niveaux, styles, menu) :

```bash
python manage.py load_initial_data
```

Cela crée : Level (débutant, intermédiaire, avancé, professionnel), DanceStyle (bachata, salsa, kizomba), MenuItem (Accueil, Explore, Cours, Événements, Login).

### Données démo

Pour peupler le site avec des cours, événements et noeuds Explore (démo) :

```bash
python manage.py load_demo_data
```

**Prérequis :** `load_initial_data` doit avoir été exécuté avant.

**Contenu créé :**
- **Noeuds d’organisation :** Capital of Fusion (racine), BachataVibe Paris, BachataVibe Lyon (paramètres 3D pour Explore).
- **NodeEvents :** 3 événements associés aux noeuds (affichés dans l’overlay Explore).
- **Cours :** Bachata Débutant, Bachata Intermédiaire, Salsa Débutant (avec horaires récurrents).
- **Événements :** Festival Bachata Fusion, Soirée Social Bachata, Atelier Sensual (avec un pass chacun).

Voir `docs/explication/donnees_demo.md` pour le détail.

## API (lecture seule Phase 1)

- `GET /api/menu/items/` — menu navbar (racine + children récursifs)
- `GET /api/courses/` — liste des cours actifs (filtres : `?style=`, `?level=`, `?node=`)
- `GET /api/events/` — liste des événements (filtres : `?type=`, `?node=`, `?upcoming=1`)

Voir `docs/bmad/03-api_docs.md` pour le détail.
