# 📡 Documentation API — Site Bachata V5

**Référence des endpoints et contrats API** (référence BMAD).

---

## 1. Base URL & authentification

- **Base URL (dev) :** `http://localhost:8000` ou `http://127.0.0.1:8000`
- **Phase 1 :** tous les endpoints listés sont en **lecture seule** ; pas d’authentification requise.
- **CORS :** origines autorisées pour le front Next.js : `http://localhost:3000`, `http://127.0.0.1:3000`

---

## 2. Endpoints Phase 1

### 2.1 Menu (navbar)

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/api/menu/items/` | Liste des entrées de menu **racine** (parent=None), avec **children** récursifs. Tri par `order`. Uniquement les items actifs (`is_active=True`). |

**Exemple de réponse :**
```json
[
  {
    "id": "uuid",
    "name": "Accueil",
    "slug": "accueil",
    "url": "/",
    "icon": "",
    "order": 1,
    "is_active": true,
    "children": []
  },
  {
    "id": "uuid",
    "name": "Cours",
    "slug": "cours",
    "url": "/cours/",
    "icon": "",
    "order": 3,
    "is_active": true,
    "children": []
  }
]
```

---

### 2.2 Cours

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/api/courses/` | Liste des **cours actifs** (`is_active=True`). Filtres optionnels en query params. |

**Paramètres de filtre (query params) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `style` | slug | Filtre par slug du style (DanceStyle) |
| `level` | slug | Filtre par slug du niveau (Level) |
| `node` | slug ou UUID | Filtre par noeud (slug ou id OrganizationNode) |

**Exemple :** `GET /api/courses/?level=beginner&style=bachata`

**Exemple de réponse :**
```json
[
  {
    "id": "uuid",
    "name": "Bachata Débutant",
    "slug": "bachata-debutant",
    "description": "...",
    "style": "uuid",
    "style_name": "Bachata",
    "level": "uuid",
    "level_name": "Débutant",
    "node": "uuid",
    "node_name": "Capital of Fusion",
    "is_active": true,
    "image": null
  }
]
```

---

### 2.3 Événements

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/api/events/` | Liste des **événements**. Filtres optionnels en query params. |

**Paramètres de filtre (query params) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `type` | string | FESTIVAL, PARTY ou WORKSHOP |
| `node` | slug ou UUID | Filtre par noeud (OrganizationNode) |
| `upcoming` | 1 / true / yes | Si présent, ne retourne que les événements dont `end_date >= aujourd’hui` |

**Exemple :** `GET /api/events/?upcoming=1&type=FESTIVAL`

**Exemple de réponse :**
```json
[
  {
    "id": "uuid",
    "name": "Festival Bachata",
    "slug": "festival-bachata",
    "type": "FESTIVAL",
    "description": "...",
    "start_date": "2025-06-01",
    "end_date": "2025-06-03",
    "location_name": "Paris",
    "node": "uuid",
    "node_name": "BachataVibe Paris",
    "image": null
  }
]
```

---

## 3. Codes de statut & erreurs

- **200 OK** : requête réussie, corps = liste ou objet JSON.
- **404** : ressource non trouvée (non utilisé en Phase 1 pour ces endpoints liste).
- **500** : erreur serveur ; format d’erreur DRF par défaut.

---

*Dernière mise à jour : 2025-02-10*
