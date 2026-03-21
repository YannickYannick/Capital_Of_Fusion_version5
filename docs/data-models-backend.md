# Modèles de données (backend Django)

## Vue d’ensemble

Les modèles sont répartis par application sous **`backend/apps/*/models.py`**. Les champs exposés en plusieurs langues utilisent **django-modeltranslation** (fichiers `translation.py` par app).

## Applications et domaines

| App | Contenu principal |
|-----|-------------------|
| `core` | `SiteConfiguration`, `MenuItem`, `Bulletin`, `ExplorePreset`, `PendingContentEdit`, niveaux/styles de danse référentiels, etc. |
| `courses` | `Course`, plannings / théorie (`TheoryLesson`, horaires) |
| `events` | `Event`, billets (`EventPass` si présent) |
| `organization` | `OrganizationNode`, pôles, membres équipe |
| `partners` | Structures et contenus partenaires |
| `users` | Utilisateur custom, profils artistes |
| `shop` | Catégories / produits |
| `care` | Praticiens, soins |
| `projects` | Projets / catégories |
| `trainings` | Passes, sessions |
| `artists` | Données liées artistes (selon modèles) |

## Migrations

- Répertoire : `backend/apps/*/migrations/`.
- Après modification des modèles : `python manage.py makemigrations` puis `migrate`.

## Traduction BDD

- Colnes logiques `_fr`, `_en`, `_es` générées par modeltranslation pour les modèles enregistrés dans `translation.py`.
- Documentation métier : [mcp-traduction/traduction-pages-et-champs.md](./mcp-traduction/traduction-pages-et-champs.md).
