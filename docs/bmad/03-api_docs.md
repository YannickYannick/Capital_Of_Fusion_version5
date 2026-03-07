# 📡 Documentation API — Site Bachata V5

**Référence des endpoints et contrats API** (référence BMAD).

---

## 1. Base URL & authentification

- **Base URL (dev) :** `http://localhost:8000` ou `http://127.0.0.1:8000`
- **Base URL (prod Railway) :** `https://capitaloffusionversion5-production.up.railway.app`
- **Préfixe API :** `/api/` — tous les endpoints ci-dessous sont sous `{Base URL}/api/`.
- **CORS :** origines autorisées pour le front Next.js : `http://localhost:3000`, `http://127.0.0.1:3000` (dev) ; en prod : `CORS_ALLOWED_ORIGINS` (ex. URL Vercel).
- **Auth :** Token DRF. `POST /api/auth/login/` renvoie `{ "token": "..." }` ; les endpoints protégés utilisent l’en-tête `Authorization: Token <key>`.

### Liste complète des endpoints (prod)

| Méthode | URL complète (prod) |
|--------|----------------------|
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/health/` |
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/menu/items/` |
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/courses/` |
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/courses/<slug>/` |
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/events/` |
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/events/<slug>/` |
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/organization/nodes/` |
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/organization/nodes/<slug>/` |
| POST | `https://capitaloffusionversion5-production.up.railway.app/api/auth/login/` |
| POST | `https://capitaloffusionversion5-production.up.railway.app/api/auth/google/` |
| POST | `https://capitaloffusionversion5-production.up.railway.app/api/auth/logout/` |
| GET | `https://capitaloffusionversion5-production.up.railway.app/api/auth/me/` |

**Core (config + presets) :**

| Méthode | URL |
|--------|-----|
| GET | `.../api/config/` |
| GET / POST / PATCH / DELETE | `.../api/core/presets/` |

**Identité COF (vision + bulletins) :**

| Méthode | URL | Auth |
|--------|-----|------|
| GET | `.../api/config/` | — |
| PATCH | `.../api/admin/config/` | Token (staff/superuser) |
| GET | `.../api/identite/bulletins/` | — |
| GET | `.../api/identite/bulletins/<slug>/` | — |
| GET / POST | `.../api/admin/identite/bulletins/` | Token (staff/superuser) |
| GET / PATCH | `.../api/admin/identite/bulletins/<slug>/` | Token (staff/superuser) |

**Hors API (Django admin) :** `https://capitaloffusionversion5-production.up.railway.app/admin/`

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

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/api/courses/<slug>/` | Détail d’un cours actif par slug. 404 si inactif ou inexistant. |

**Exemple de réponse (liste) :**
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

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/api/events/<slug>/` | Détail d’un événement par slug. |

**Exemple de réponse (liste) :**
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

### 2.4 Organisation (Explore 3D)

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/api/organization/nodes/` | Liste des noeuds visibles en 3D (`is_visible_3d=True`), avec paramètres 3D et `node_events`. |
| GET | `/api/organization/nodes/<slug>/` | Détail d’un noeud par slug (pour overlay). |

---

### 2.5 Auth

| Méthode | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/login/` | Body : `{ "username", "password" }`. Réponse : `{ "token": "..." }`. |
| POST | `/api/auth/google/` | Body : `{ "id_token": "<JWT Google>" }`. Vérifie le token, crée ou récupère le User par email, réponse : `{ "token": "..." }`. Variable d'env backend : `GOOGLE_OAUTH_CLIENT_ID`. |
| POST | `/api/auth/logout/` | Déconnexion (supprime le token). Header : `Authorization: Token <key>`. |
| GET | `/api/auth/me/` | Utilisateur courant. Header : `Authorization: Token <key>`. |

---

### 2.6 Core — Config site & Presets Explore

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/api/config/` | Configuration singleton du site : champs hero (titres, textes, liens boutons), vidéos, **active_explore_preset** (objet preset ou null). Utilisé par la landing et la page Explore pour charger le preset 3D par défaut. |
| GET | `/api/core/presets/` | Liste des presets Explore 3D. |
| POST | `/api/core/presets/` | Création d'un preset (options 3D + position caméra). Body : voir `ExplorePreset` (serializer). Auth optionnelle. |
| GET | `/api/core/presets/<id>/` | Détail d'un preset. |
| PATCH | `/api/core/presets/<id>/` | Mise à jour partielle. |
| DELETE | `/api/core/presets/<id>/` | Suppression. |

*Détail des champs et usage frontend : voir `docs/features/explore-presets.md` et `docs/features/landing-config.md`.*

---

## 3. Codes de statut & erreurs

- **200 OK** : requête réussie, corps = liste ou objet JSON.
- **204 No Content** : logout réussi.
- **400** : paramètres manquants ou invalides (ex. login sans username/password).
- **401** : non autorisé (identifiants incorrects ou token manquant/invalide).
- **404** : ressource non trouvée (slug inexistant).
- **500** : erreur serveur ; format d’erreur DRF par défaut.

---

*Dernière mise à jour : 2026-03-07*
