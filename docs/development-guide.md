# Guide de développement

## Prérequis

- **Node.js** (LTS recommandé) et **npm** pour le frontend.
- **Python 3.11+** (ou version supportée par le projet) et **pip** pour le backend.
- **PostgreSQL** pour l’environnement aligné sur la prod (SQLite possible en dev selon `settings`).

## Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Unix: source .venv/bin/activate
pip install -r requirements.txt
# Configurer .env (DATABASE_URL, SECRET_KEY, ALLOWED_HOSTS, CORS, etc.)
python manage.py migrate
python manage.py runserver
```

Commandes utiles : `createsuperuser`, `load_initial_data` (si présente), `translate_models` (traductions batch — voir commandes management).

## Frontend

```bash
cd frontend
npm install
# Créer .env.local avec NEXT_PUBLIC_API_URL=http://localhost:8000 (ou URL API)
npm run dev
npm run build   # vérification production
npm run lint
```

## Tests

- Backend : tests Django dans `apps/*/tests/` si présents — `python manage.py test`.
- Frontend : pas de suite e2e imposée dans ce scan ; fichiers `*.test.*` selon évolution du projet.

## Internationalisation

- Cookie **`locale`** = `fr` | `en` | `es` (voir navbar).
- Documentation : [explication/traduction-i18n.md](./explication/traduction-i18n.md).

## CI / déploiement

- Vérifier présence de workflows sous `.github/workflows/` si configurés.
- Guides déploiement : [explication/deploiement.md](./explication/deploiement.md).
