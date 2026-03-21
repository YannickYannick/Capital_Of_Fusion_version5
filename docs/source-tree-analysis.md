# Arborescence annotée

Racine du dépôt : **`Projet - site bachata V5/`**

```text
.
├── backend/                 # API Django
│   ├── config/              # settings, urls, wsgi, asgi, api_urls (routes REST)
│   ├── apps/                # applications métier (core, courses, events, …)
│   │   └── */migrations/    # migrations Django
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # Next.js
│   ├── public/              # assets statiques (logo, …)
│   ├── src/
│   │   ├── app/             # App Router (routes, layouts)
│   │   ├── components/      # UI partagée + features
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── lib/             # api.ts, utilitaires
│   │   └── types/           # types TypeScript API
│   ├── messages/            # fr.json, en.json, es.json (next-intl)
│   └── package.json
├── docs/                    # Documentation (ce dossier)
└── _bmad/                   # Workflows BMAD (référence outillage)
```

## Répertoires critiques

| Chemin | Rôle |
|--------|------|
| `frontend/src/app/(main)/` | Pages publiques regroupées (layout commun, navbar) |
| `frontend/src/lib/api.ts` | Point central des appels HTTP vers l’API |
| `backend/config/api_urls.py` | Cartographie des endpoints REST |
| `backend/apps/*/models.py` | Modèles ORM et migrations associées |
| `docs/mcp-traduction/` | Inventaire et stratégie de traduction |

## Points d’entrée

- **Frontend** : `frontend/src/app/layout.tsx`, layouts `(main)/layout.tsx`.
- **Backend** : `backend/manage.py`, `backend/config/urls.py` incluant les URLs API.
