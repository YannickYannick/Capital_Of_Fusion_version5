# Phase 6 — Pages dynamiques & refactoring backend

**Date** : Mars 2026

## Résumé

Transformation de 15+ pages statiques (`SkeletonPage`) en pages dynamiques connectées à l'API backend. Refactoring des modèles backend pour hériter de `BaseModel` et standardisation des serializers/views.

---

## 1. Modifications Backend

### 1.1 Modèles refactorisés

Les modèles des apps `trainings`, `shop` et `care` héritent maintenant de `BaseModel` (UUID, `created_at`, `updated_at`).

#### Trainings (`backend/apps/trainings/models.py`)

| Modèle | Champs ajoutés |
|--------|----------------|
| `SubscriptionPass` | `slug`, `duration_days`, `sessions_included`, `is_active`, `order` |
| `TrainingSession` | `slug`, `description`, `instructor` (FK User), `location`, `level` (FK), `is_cancelled` |
| `TrainingRegistration` | Nouveau modèle (inscription user → session) |

#### Shop (`backend/apps/shop/models.py`)

| Modèle | Champs ajoutés |
|--------|----------------|
| `Category` | `icon`, `image`, `order`, `is_active` |
| `Product` | `slug`, `short_description`, `compare_price`, `images` (JSON), `sizes`, `colors`, `stock`, `is_featured`, `order` |

#### Care (`backend/apps/care/models.py`)

| Modèle | Champs ajoutés |
|--------|----------------|
| `Practitioner` | `slug`, `short_bio`, `phone`, `email`, `website`, `booking_url`, `is_active`, `order` |
| `ServiceCategory` | Nouveau modèle (catégorie de soins) |
| `Service` | `slug`, `short_description`, `category` (FK), `image`, `is_available`, `order` |

### 1.2 Serializers enrichis

- **Shop** : `ProductListSerializer` (allégé pour les listes)
- **Care** : `PractitionerListSerializer`, `ServiceCategorySerializer`
- **Trainings** : `TrainingRegistrationSerializer`

### 1.3 Views avec filtres

| API | Filtres disponibles |
|-----|---------------------|
| `GET /api/shop/products/` | `?category=slug`, `?featured=1`, `?available=1` |
| `GET /api/care/services/` | `?category=slug`, `?practitioner=slug` |
| `GET /api/trainings/sessions/` | `?upcoming=1`, `?level=slug` |
| `GET /api/projects/projects/` | `?status=IN_PROGRESS`, `?category=id` |

### 1.4 ProjectViewSet corrigé

Les ViewSets `ProjectCategoryViewSet` et `ProjectViewSet` étaient vides (`pass`). Ils sont maintenant fonctionnels avec `ModelViewSet`.

---

## 2. Nouvelles routes API

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/shop/categories/<slug>/` | GET | Détail catégorie |
| `/api/shop/products/<slug>/` | GET | Détail produit |
| `/api/care/categories/` | GET | Liste catégories soins |
| `/api/care/practitioners/<slug>/` | GET | Détail praticien |
| `/api/trainings/sessions/<slug>/` | GET | Détail session |
| `/api/trainings/sessions/<slug>/register/` | POST | Inscription (auth) |

---

## 3. Pages Frontend transformées

### 3.1 Shop (5 pages)

| Avant | Après |
|-------|-------|
| `/shop` (SkeletonPage) | Page dynamique avec catégories + produits mis en avant |
| `/shop/chaussures` (statique) | Supprimée → `/shop/[category]` dynamique |
| `/shop/pulls` (statique) | Supprimée → `/shop/[category]` dynamique |
| `/shop/tshirts` (statique) | Supprimée → `/shop/[category]` dynamique |
| `/shop/vins` (statique) | Supprimée → `/shop/[category]` dynamique |

### 3.2 Care (2 pages)

| Page | État |
|------|------|
| `/care/praticiens` | Dynamique — liste des praticiens |
| `/care/soins` | Dynamique — liste des services avec filtres catégories |

### 3.3 Trainings (3 pages)

| Page | État |
|------|------|
| `/trainings` | Dynamique — pass + prochaines sessions |
| `/trainings/sessions` | Dynamique — sessions groupées par date |
| `/trainings/adherents` | Client-side — espace membre (requiert auth) |

### 3.4 Explore

| Page | État |
|------|------|
| `/explore/liste` | Dynamique — vue liste 2D des nœuds organisation |

### 3.5 Projets (2 pages)

| Page | État |
|------|------|
| `/projets/incubation` | Dynamique — projets `status=UPCOMING` |
| `/projets/initiatives` | Dynamique — projets `status=IN_PROGRESS` |

### 3.6 Événements

| Page | État |
|------|------|
| `/evenements/festivals` | Dynamique — événements `type=FESTIVAL` |

### 3.7 Artistes

| Page | État |
|------|------|
| `/artistes/profils` | Dynamique — grille de profils artistes |

---

## 4. Types TypeScript mis à jour

### `types/shop.ts`
- `ProductCategoryApi` : ajout `icon`, `image`, `order`, `products_count`
- `ProductApi` : ajout `short_description`, `compare_price`, `images`, `sizes`, `colors`, `stock`, `is_featured`, `in_stock`
- `ProductListApi` : nouveau type allégé

### `types/care.ts`
- `ServiceCategoryApi` : nouveau
- `PractitionerApi` : ajout `short_bio`, `services`, `services_count`
- `PractitionerListApi` : nouveau type allégé
- `CareServiceApi` : ajout `category`, `short_description`, `image`

### `types/trainings.ts`
- `SubscriptionPassApi` : ajout `slug`, `benefits`, `duration_days`, `sessions_included`
- `TrainingSessionApi` : ajout `slug`, `instructor_display`, `level_name`, `spots_left`, `registrations_count`
- `TrainingRegistrationApi` : nouveau

---

## 5. Fonctions API ajoutées (`lib/api.ts`)

```typescript
// Shop
getProductCategoryBySlug(slug: string)
getProducts(params?: { category?: string; featured?: boolean })
getProductBySlug(slug: string)

// Care
getServiceCategories()
getPractitionerBySlug(slug: string)
getCareServices(params?: { category?: string; practitioner?: string })

// Trainings
getTrainingSessions(params?: { upcoming?: boolean; level?: string })
getTrainingSessionBySlug(slug: string)
registerToTrainingSession(slug: string)

// Projects
getProjects(params?: { status?: string; category?: string })
```

---

## 6. Migrations requises

Après cette mise à jour, générer les migrations :

```bash
cd backend
python manage.py makemigrations trainings shop care
python manage.py migrate
```

**Note** : Les données existantes dans ces tables seront préservées. Les nouveaux champs ont des valeurs par défaut.

---

## 7. Prochaines étapes

1. **Cours** : Transformer `/cours/filtres`, `/cours/planning`, `/cours/programmes`
2. **Care** : Ajouter page détail praticien `/care/praticiens/[slug]`
3. **Shop** : Ajouter page détail produit `/shop/produit/[slug]`
4. **Édition inline** : Système d'édition admin pour toutes les pages
