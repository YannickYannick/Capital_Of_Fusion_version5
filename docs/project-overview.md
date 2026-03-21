# Vue d’ensemble — Projet site Bachata V5

## Nom et objectif

**Capital of Fusion** — site vitrine et outil métier pour une école / communauté de danse (bachata et styles associés) : cours, événements, organisation, partenaires, shop, care, formations, explore 3D, etc.

## Structure du dépôt

- **`frontend/`** : application **Next.js 15** (App Router), **React 19**, **Tailwind CSS**, **Three.js** (scène Explore), **next-intl** pour les libellés statiques.
- **`backend/`** : **Django 5** + **Django REST Framework**, **PostgreSQL** (psycopg), **django-modeltranslation** pour les champs multilingues, authentification classique + Google OAuth.

## Classification

- **Type** : monorepo **multi-part** (client + API séparés dans le même repo).
- **Communication** : HTTP REST JSON (`NEXT_PUBLIC_API_URL` → backend), cookie `locale` côté Next pour aligner l’API (`?lang=`).

## Liens utiles

| Document | Rôle |
|----------|------|
| [architecture.md](./architecture.md) | Découpage technique et flux |
| [api-contracts.md](./api-contracts.md) | Liste des routes API |
| [development-guide.md](./development-guide.md) | Prérequis et commandes |
