# 📐 Spécifications techniques — Site Bachata V5

**Décisions d'architecture et définitions de schémas** (référence BMAD).

**Référence alignement :** `C:\...\Projet - site bachata V4\refactorisation_V5_Structuré\` — voir aussi [09-analyse_alignement.md](09-analyse_alignement.md).

---

## 1. Stack & environnement

| Élément | Choix | Note |
|---------|--------|------|
| **Front-end** | Next.js 15 (App Router) + Tailwind CSS + Three.js | SSR pour SEO, mobile-first ; Three.js pour Explore 3D. |
| **Back-end / API** | Django + Django REST Framework (DRF) | API REST, auth (rôles participant/artiste/admin). |
| **Base de données** | PostgreSQL | Données relationnelles (users, cours, événements, organisations). |
| **Hébergement** | À préciser | V4 : Vercel (front), Railway/Render (back), cPanel. À valider pour V5. |
| **CI/CD** | À définir | Déploiement par phases (étapes V5). |

---

## 2. Architecture

### Principes généraux

- **Front :** application Next.js (SPA-like avec SSR pour les pages critiques : landing, cours, événements).
- **Back :** API REST exposée par Django/DRF ; front consomme les endpoints pour données dynamiques.
- **SEO :** priorité SSR sur les pages publiques ; score cible > 90 (Lighthouse).
- **Mobile-first :** conception prioritaire mobile ; responsive obligatoire.

### Modules fonctionnels

| Module | Rôle | Pages / fonctionnalités associées |
|--------|------|-----------------------------------|
| **Landing** | Présentation école (Capital of Fusion) | Page d'accueil immersive ; vidéo fond via **YouTube** (embeds), CTA vers Explore et Cours. |
| **Explore 3D** | Navigation « planétaire » (OrganizationNode) | Scène Three.js, overlay détail (PlanetOverlay), NodeEvent ; fallback liste/arbre (mobile, a11y). |
| **Cours** | Catalogue et vente de cours | `/cours/`, filtres (style, niveau, prof), recherche, détail. |
| **Événements** | Agenda et mise en avant d'événements | `/evenements/`, calendrier, lieux, passes, types (festival, soirée). |
| **Boutique / Shop** | Catalogue produits (Phase 2) | `/boutique/`, ProductCategory, Product, Order. |
| **Organisation** | Structure et pôles (Phase 2) | `/organisation/structure/`, `/organisation/poles/`. |
| **Auth / utilisateurs** | Gestion des rôles | Login, register ; participant, artiste, admin. |
| **Navbar / Menu** | Navigation dynamique | API `GET /api/menu/items/` ; MenuItem récursif ; ordre et sous-menus selon [04-maquettes_ui_jour](../refactorisation_v4/structure/04-maquettes_ui_jour.md). |
| **Futur (Phase 2+)** | Formations, Trainings, Artistes, Théorie, Care, Projets | Voir MCD V4. |

### Structure projet (alignée sur refactorisation_V5_Structuré)

**Frontend (Next.js) — 1 layout, monorepo :**
```
frontend/src/app/
├── (main)/          # Toutes les pages — 1 layout partagé (landing, explore, cours, événements, boutique, organisation, login)
├── layout.tsx, globals.css
components: ui/, shared/, features/
hooks/, lib/, contexts/, store/, types/
```

**Backend (Django) :**
```
backend/config/settings/ (base, local, production)
backend/apps/: core, users, organization, courses, events, shop
```

- **Phase 1 (MVP) :** focus `(site)`, `(app)` pour Cours/Événements/Explore, `(auth)` ; apps core, users, organization, courses, events.
- **Phase 2+ :** shop, formations, trainings, artistes, etc. (voir MCD V4).

---

## 3. Schémas / modèles de données

### Phase 1 — Entités prioritaires

| Entité | Description | Relations clés |
|--------|-------------|----------------|
| **User** | Utilisateur (participant, artiste, admin) ; is_vibe, métiers (DanceProfession) | Enrollment, Registration, roles |
| **OrganizationNode** | Nœud Explore 3D (planètes) ; récursif, paramètres 3D (orbit_radius, planet_type, etc.) | Course, Event, NodeEvent |
| **Course** | Cours (catalogue) | style_id (DanceStyle), level_id (Level), node_id, teachers M-N User, Schedule |
| **Event** | Événement (festival, soirée) | EventPass, Registration ; node_id |
| **NodeEvent** | Événement léger dans overlay d'un nœud | Distinct de Event (pas de billetterie) |
| **Schedule** | Horaires récurrents par cours | course_id, day_of_week, start_time, end_time |
| **EventPass** | Pass d'événement | event_id, name, price, quantity_available |
| **MenuItem** | Navigation dynamique (API `GET /api/menu/items/`) | Récursif parent/children ; pilote navbar |

### MCD complet (référence V4)

Le MCD détaillé (Core, Users, Organization, Courses, Events, Shop, Formations, Trainings, Artistes, Théorie, Care, Projets) est documenté dans :
[refactorisation_v4/structure/02-mcd_modele_donnees.md](../refactorisation_v4/structure/02-mcd_modele_donnees.md).

### Niveaux de cours (référence V4)

- `beginner` → `intermediate` → `advanced` → `professional` ; entité **Level** (slug, order, color).

### Styles

- **DanceStyle** (récursif parent/sub_styles) : fusion, dominicana, sensual, etc.

---

## 4. Conventions techniques

- **Nommage :**
  - Composants React : PascalCase.
  - Fichiers : kebab-case ou alignés sur le framework (ex. `page.tsx` pour Next.js).
  - Routes API : RESTful, kebab-case ou snake_case selon conventions DRF.
- **Structure :**
  - Front : composants réutilisables dans `components/`, pages dans `app/`, hooks/utils dans `lib/`.
  - Back : une app Django par domaine (users, courses, events, organisations).
- **Bonnes pratiques :**
  - Mobile-first CSS (Tailwind).
  - SEO : meta, titres, SSR sur pages publiques.
  - Accessibilité : sémantique HTML, contrastes, navigation clavier ; fallback liste/arbre pour Explore 3D.

### Design system (réf. [04-maquettes_ui_jour](../refactorisation_v4/structure/04-maquettes_ui_jour.md))

- Fond : `#0a0e27` ; texte : blanc ; accent : purple (purple-400 à 200) ; logo : gradient purple → pink.
- Navbar : transparente → `bg-black/80 backdrop-blur-md` au scroll.
- Police : Inter (Tailwind).

### Vidéo de fond — Landing

| Choix | Détail |
|-------|--------|
| **Source** | YouTube uniquement (embed IFrame API). ID configurable via `NEXT_PUBLIC_YOUTUBE_VIDEO_ID`. |
| **Son** | Activé par défaut. Bouton permet de couper/rétablir le son. *Note : certains navigateurs bloquent l’autoplay avec son sans interaction utilisateur.* |
| **Qualité** | Sélectionnable par l’utilisateur : 360p, 480p, 720p, 1080p (boutons sur la landing). Par défaut 720p. |
| **Redimensionnement** | Comportement « cover » : le lecteur (1920×1080) est mis à l’échelle pour toujours couvrir la fenêtre ; `scale = max(largeur/1920, hauteur/1080)` ; recalcul au resize. |
| **Composant** | `frontend/src/components/shared/YouTubeVideoBackground.tsx`. |

---

*Dernière mise à jour : 2025-02-10*
