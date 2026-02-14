# Arborescence cible V5

Structure des dossiers et fichiers visée pour la V5.

**Décisions V5 :** 1 layout unique ; monorepo `frontend/` + `backend/`.

---

## Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/
│   │   ├── (main)/           # Toutes les pages — 1 layout partagé
│   │   │   ├── page.tsx      # Landing
│   │   │   ├── explore/
│   │   │   ├── cours/
│   │   │   ├── evenements/
│   │   │   ├── boutique/
│   │   │   ├── organisation/
│   │   │   ├── login/
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/               # Composants de base
│   │   ├── shared/
│   │   └── features/
│   ├── hooks/
│   ├── lib/
│   ├── contexts/
│   ├── store/
│   └── types/
├── public/
└── ...
```

---

## Backend (Django)

```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── local.py
│   │   └── production.py
│   ├── urls.py
│   └── ...
├── apps/
│   ├── core/
│   ├── users/
│   ├── organization/
│   ├── courses/
│   ├── events/
│   └── shop/
└── ...
```

---

*Adapté depuis refactorisation_V5_Structuré (V4) — 2025-02-10*
