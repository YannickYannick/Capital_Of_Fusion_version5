# Contrats API — aperçu

Préfixe API : selon déploiement, les routes ci-dessous sont sous **`/api/`** (voir `backend/config/urls.py`).

> Ce document résume les chemins ; pour le détail des corps de requête/réponse, se référer aux **serializers** et vues dans `backend/apps/*/views.py`.

## Core & configuration

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `health/` | Santé du service |
| GET | `config/` | Configuration site (vidéos, textes identité, preset explore) |
| GET | `menu/items/` | Menu navbar (items récursifs) |
| GET | `identite/bulletins/` | Liste bulletins |
| GET | `identite/bulletins/<slug>/` | Détail bulletin |
| POST | `seed/` | Graine données (selon sécurité) |

## Cours & théorie

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `courses/` | Liste cours |
| GET | `courses/<slug>/` | Détail cours |
| GET | `courses/schedules/` | Planning |
| GET | `courses/theory/` | Leçons théorie |
| GET | `courses/theory/<slug>/` | Détail leçon |

## Événements

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `events/` | Liste |
| GET | `events/<slug>/` | Détail |

## Organisation & partenaires

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `organization/nodes/` | Nœuds organisation |
| GET | `organization/nodes/<slug>/` | Détail nœud |
| GET | `organization/poles/` | Pôles |
| GET | `organization/staff/` | Staff |
| GET | `partners/nodes/` … | Partenaires (structures, événements, cours) |

## Utilisateurs & artistes

| Méthode | Chemin | Description |
|---------|--------|-------------|
| POST | `auth/login/` | Connexion |
| POST | `auth/register/` | Inscription |
| POST | `auth/google/` | OAuth Google |
| POST | `auth/logout/` | Déconnexion |
| GET | `auth/me/` | Profil courant |
| GET | `users/artists/` | Liste artistes |
| GET | `users/artists/<username>/` | Profil artiste |

## ViewSets (routeur DRF)

Préfixes typiques : `shop/categories/`, `shop/products/`, `care/practitioners/`, `care/categories/`, `care/services/`, `projects/categories/`, `projects/projects/`, `trainings/passes/`, `trainings/sessions/`, `core/presets/` (Explore).

## Routes admin API (`/api/admin/...`)

Création / mise à jour réservées au staff (événements, cours, config, bulletins, traduction assistée, pending edits, etc.). Voir `backend/config/api_urls.py` pour la liste exhaustive.
