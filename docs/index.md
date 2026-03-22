# Index documentation projet — Capital of Fusion (site Bachata V5)

> Généré par le workflow BMAD **document-project** (scan initial, mars 2025). Point d’entrée pour le développement assisté par IA et l’onboarding.

## Vue rapide

| Attribut | Valeur |
|----------|--------|
| **Type de dépôt** | Monorepo à deux parties : **frontend** (Next.js) + **backend** (Django REST) |
| **Langages** | TypeScript / React (frontend), Python / Django (backend) |
| **i18n** | `next-intl` + messages JSON ; API Django avec `?lang=fr|en|es` + `django-modeltranslation` |

### Parties

| Partie | ID | `project_type` (CSV BMAD) | Racine |
|--------|-----|---------------------------|--------|
| Frontend web | `frontend` | web | `frontend/` |
| API & données | `backend` | backend | `backend/` |

---

## Documentation générée (référence technique)

- [Vue d’ensemble du projet](./project-overview.md)
- [Architecture](./architecture.md)
- [Arborescence annotée](./source-tree-analysis.md)
- [Contrats API (aperçu)](./api-contracts.md)
- [Modèles de données (backend)](./data-models-backend.md)
- [Guide de développement](./development-guide.md)
- [Inventaire composants UI (frontend)](./component-inventory-frontend.md)

---

## Documentation existante (métier & process)

- [README docs](./README.md) — navigation du dossier `docs/`
- [Traduction / i18n](./explication/traduction-i18n.md)
- [Stratégie traduction (décisions)](./mcp-traduction/strategie-traduction-decisions.md)
- Dossiers : `docs/features/`, `docs/bmad/`, `docs/mcp-traduction/`, `docs/explication/`
- [Traduction admin Identité COF](./features/traduction-identite-cof-admin.md) — modale EN/ES, aperçus, `GET /api/admin/config/`

---

## Démarrage rapide

1. **Backend** : `cd backend` → environnement virtuel Python → `pip install -r requirements.txt` → `python manage.py migrate` → `python manage.py runserver` (port 8000 par défaut).
2. **Frontend** : `cd frontend` → `npm install` → `npm run dev` (Next.js, souvent port 3000).
3. Variables : voir `.env` / `.env.local` (ex. `NEXT_PUBLIC_API_URL`, base PostgreSQL sur Railway en prod).

---

## Fichiers d’état workflow

- État du scan : [`project-scan-report.json`](./project-scan-report.json)

---

*Pour un PRD brownfield, fournir ce fichier `index.md` comme entrée contextuelle.*
