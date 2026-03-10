# Mémo – ViewSet & Architecture API

## 1. Rappel : c’est quoi un ViewSet ?

Dans **Django REST Framework**, un `ViewSet` regroupe dans **une seule classe** toutes les actions REST d’une ressource :

- `list` → `GET /ressource/`
- `retrieve` → `GET /ressource/<id>/`
- `create` → `POST /ressource/`
- `update` / `partial_update` → `PUT/PATCH /ressource/<id>/`
- `destroy` → `DELETE /ressource/<id>/`

Avec un **router** (`DefaultRouter`), DRF génère automatiquement les routes à partir du `ViewSet`.  
Ça évite de multiplier les vues du type `XxxListAPIView`, `XxxDetailAPIView`, `XxxAdminAPIView`, etc.

## 2. État actuel dans le projet

Backend : `backend/apps/*`

- **Courses** (`apps/courses/views.py`)
  - `CourseListAPIView` – GET `/api/courses/`
  - `CourseDetailAPIView` – GET `/api/courses/<slug>/`
  - `CourseAdminAPIView` – POST `/api/admin/courses/`
  - `CourseAdminDetailAPIView` – PATCH/DELETE `/api/admin/courses/<slug>/`
  - `TheoryLessonListAPIView` / `TheoryLessonDetailAPIView`
  - `TheoryLessonAdminAPIView` / `TheoryLessonAdminDetailAPIView`

- **Events** (`apps/events/views.py`)
  - `EventListAPIView` – GET `/api/events/`
  - `EventDetailAPIView` – GET `/api/events/<slug>/`
  - `EventAdminAPIView` – POST `/api/admin/events/`
  - `EventAdminDetailAPIView` – PATCH/DELETE `/api/admin/events/<slug>/`

- **Organization** (`apps/organization/views.py`)
  - `OrganizationNodeListAPIView` – GET `/api/organization/nodes/`
  - `OrganizationNodeDetailAPIView` – GET `/api/organization/nodes/<slug>/`
  - `OrganizationNodeAdminDetailAPIView` – PATCH `/api/admin/organization/nodes/<slug>/`

- **Projects** (`apps/projects/views.py`)
  - `ProjectCategoryViewSet(viewsets.ViewSet)` – vide (`pass`)
  - `ProjectViewSet(viewsets.ViewSet)` – vide (`pass`)
  - Routes déjà enregistrées : `/api/projects/categories/`, `/api/projects/projects/`

Ces vues fonctionnent, mais la logique est **éclatée** en plusieurs classes par ressource.

## 3. Où les ViewSet pourraient remplacer les vues actuelles ?

### 3.1. Courses

Objectif : un `CourseViewSet` + éventuellement un `TheoryLessonViewSet`.

Ils pourraient remplacer :

- `CourseListAPIView` / `CourseDetailAPIView`
- `CourseAdminAPIView` / `CourseAdminDetailAPIView`
- `TheoryLessonListAPIView` / `TheoryLessonDetailAPIView`
- `TheoryLessonAdminAPIView` / `TheoryLessonAdminDetailAPIView`

Stratégie possible :

- Exposer les actions **lecture publique** (`list`, `retrieve`) sans auth stricte.
- Garder les actions **écriture** (`create`, `update`, `partial_update`, `destroy`) protégées par permissions (`IsSuperUser` ou workflow staff/admin).

### 3.2. Events

Objectif : un `EventViewSet`.

Il pourrait remplacer :

- `EventListAPIView` / `EventDetailAPIView`
- `EventAdminAPIView` / `EventAdminDetailAPIView`

Les filtres actuels (`type`, `node`, `upcoming`) deviendraient :

- soit gérés dans `get_queryset()` du `ViewSet`,
- soit via un `FilterSet` DRF / django-filter.

### 3.3. Organization Nodes

Objectif : un `OrganizationNodeViewSet`.

Il pourrait couvrir :

- `OrganizationNodeListAPIView`
- `OrganizationNodeDetailAPIView`
- `OrganizationNodeAdminDetailAPIView` (PATCH)

Avec une logique dans `get_queryset()` (ou des actions custom) pour :

- mode « 3D » (`is_visible_3d=True`),
- mode « organigramme » (`for_structure=1`).

### 3.4. Projects

Objectif : **finaliser** les `ProjectCategoryViewSet` / `ProjectViewSet`.

Aujourd’hui :

- Les `ViewSet` existent mais sont vides.
- Le router dans `config/api_urls.py` expose déjà :
  - `/api/projects/categories/`
  - `/api/projects/projects/`

Prochaine étape :

- Transformer en `ModelViewSet` avec :
  - `queryset` (`ProjectCategory`, `Project`),
  - `serializer_class` (`ProjectCategorySerializer`, `ProjectSerializer`),
  - permissions adaptées (lecture publique, écriture admin).

## 4. Bénéfices attendus

- **Moins de duplication** : une seule classe par ressource au lieu de 3–4 vues.
- **Cohérence** : mêmes patterns pour events / courses / projects.
- **Évolutivité** : plus simple d’ajouter une action custom (`@action(detail=True/False)`).
- **Lisibilité** : quand on cherche « comment fonctionne les events », tout est dans `EventViewSet`.

## 5. Plan de migration (suggestion)

1. **Projets**  
   - Implémenter vraiment `ProjectCategoryViewSet` et `ProjectViewSet` (c’est le plus simple, peu de dépendances).

2. **Events**  
   - Créer `EventViewSet` (lecture + admin) derrière les routes actuelles, en gardant la même API pour le frontend.

3. **Courses + Theory Lessons**  
   - Refactoriser en `CourseViewSet` + `TheoryLessonViewSet`, en veillant à ne pas casser les filtres (style, level, node, category).

4. **Organization Nodes**  
   - Introduire `OrganizationNodeViewSet` en phase 2, quand la partie Explore/organisation sera stabilisée.

