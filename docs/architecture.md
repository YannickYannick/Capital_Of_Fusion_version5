# Architecture — Site Bachata V5

## Résumé exécutif

Architecture **client riche + API REST** : le navigateur exécute Next.js (SSR/CSR) et consomme une API Django stateless (sessions / JWT selon endpoints). Les contenus éditoriaux et référentiels sont en **base PostgreSQL** avec champs traduits (`_fr`, `_en`, `_es`) via **modeltranslation**.

## Frontend (`frontend/`)

- **Framework** : Next.js App Router (`src/app/`).
- **UI** : composants React sous `src/components/` (features par domaine : `explore`, etc.), layout partagé `(main)`.
- **Données** : appels via `src/lib/api.ts` vers le backend, avec paramètre de langue dérivé du cookie `locale`.
- **État global** : Contextes React (`contexts/`) — ex. auth, options Explore.
- **Internationalisation** : fichiers `messages/{fr,en,es}.json`, configuration dans `src/i18n/request.ts`.

### Schéma logique

```text
Navigateur → Next.js (pages, layouts) → api.ts (?lang=) → Django REST
                ↓
         Composants + Three.js (Explore)
```

## Backend (`backend/`)

- **Projet Django** : `config/` (settings, urls racine, `api_urls.py` pour le préfixe API).
- **Apps métier** : `apps/core`, `courses`, `events`, `organization`, `partners`, `users`, `shop`, `care`, `projects`, `trainings`, `artists`, etc.
- **API** : vues DRF (classes APIView + ViewSets pour le routeur), serializers par domaine.
- **Traduction** : middleware / langue request + `translation.py` par app pour modeltranslation.
- **Admin** : Django admin pour contenus ; routes `/api/admin/...` pour opérations staff/superuser.

## Intégration frontend ↔ backend

- **Origine** : variable d’environnement `NEXT_PUBLIC_API_URL` (ex. `http://localhost:8000` en dev).
- **CORS** : configuré côté Django pour les origines du front (Vercel / local).
- **Auth** : endpoints sous `/api/auth/` ; le front utilise cookies / flux OAuth selon implémentation (`AuthContext`).

## Déploiement (vue d’ensemble)

- Frontend souvent sur **Vercel** ; backend sur **Railway** ou équivalent avec PostgreSQL.
- Fichiers statiques : Whitenoise / stockage selon `settings.py`.

Voir aussi [explication/deploiement.md](./explication/deploiement.md) et [deploy-verification.md](./deploy-verification.md).
