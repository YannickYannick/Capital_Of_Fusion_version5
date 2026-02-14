# Analyse d'alignement — V5 (docs) ↔ refactorisation_V5_Structuré (V4)

**Objectif :** comparer la documentation V5 actuelle avec ce qui était prévu dans `refactorisation_V5_Structuré` (V4) pour assurer la cohérence avant déploiement.

**Source V4 :** `C:\...\Projet - site bachata V4\refactorisation_V5_Structuré\`

---

## 1. Ce que contient la refactorisation V4

### 1.1 Structure dossier

| Fichier | Contenu |
|---------|---------|
| `structure/01-arborescence.md` | Arborescence frontend (groupes de routes, components, hooks, etc.) et backend (config, apps) |
| `structure/02-mcd_modele_donnees.md` | MCD complet (~12 domaines : Core, Users, Organization, Courses, Events, Shop, Formations, Trainings, Artistes, Théorie, Care, Projets) |
| `structure/03-maquettes_wireframes.md` | Définitions wireframe/maquette, référence 05-maquettes_ui |
| `structure/04-maquettes_ui_jour.md` | Routes, navbar complète, design system, zones Explore 3D |
| `structure/05-maquettes_ui.md` | Maquettes UI détaillées (design system étendu, couleurs, composants) |
| `etapes/00-index.md` | Index des étapes de migration |
| `etapes/01-structure_frontend.md` | Modèle d'étape (template) |
| `REPONSES_QUESTIONNAIRE_V5.md` | Questionnaire (déjà intégré dans nos meetings/product_brief) |

### 1.2 Arborescence V4 prévue

**Frontend :**
```
frontend/src/app/
├── (site)/          # Landing, explore
├── (app)/           # Cours, événements, boutique, organisation
├── (auth)/          # Login, register
├── (dashboard)/     # Espace membre
├── layout.tsx, globals.css
components: ui/, shared/, features/
hooks/, lib/, contexts/, store/, types/
```

**Backend :**
```
backend/config/settings/ (base, local, production)
backend/apps/: core, users, organization, courses, events, shop
```

### 1.3 MCD V4 — domaines complets

| Domaine | Entités principales |
|---------|---------------------|
| **Core** | BaseModel, DanceStyle (récursif), Level, DanceProfession, SiteConfiguration, MenuItem (récursif, pilote navbar) |
| **Users** | User (is_vibe, métiers M-N DanceProfession) |
| **Organization** | OrganizationNode (récursif, paramètres 3D détaillés), OrganizationRole, UserOrganizationRole, NodeEvent |
| **Courses** | Course, Schedule, Enrollment |
| **Events** | Event, EventPass, Registration |
| **Shop** | ProductCategory, Product (node_id), Order, OrderItem |
| **Formations** | FormationCategory, FormationContent (ARTICLE/VIDEO) |
| **Trainings** | TrainingSession, TrainingSessionRegistration, TrainingAdherent |
| **Artistes** | Artist, ArtistBooking, ArtistReview |
| **Théorie** | TheoreticalCourse, Quiz, QuizQuestion, TheoryProgression |
| **Care** | CareService, Practitioner, CareBooking |
| **Projets** | Project (INCUBATION/INITIATIVE) |

### 1.4 Routes et navbar V4 (04-maquettes_ui_jour)

- **Pages principales :** `/`, `/explore/`, `/cours/`, `/evenements/`, `/boutique/`, `/organisation/`, `/login/`
- **Navbar complète :** Accueil, Boutique▾, Événements▾, Explore▾, Cours▾, Formations▾, Trainings▾, Artistes▾, Théorie▾, Care▾, Shop▾, Projets▾, Organisation▾
- **Sous-menus détaillés** pour chaque entrée (ex. Cours → Liste & Planning, Filtres, Détails programmes, Inscription)
- **Explore 3D :** OrganizationNode, overlay détail (PlanetOverlay), options (orbites, debug, vidéo fondue)
- **Design system :** `#0a0e27`, purple accents, Inter, navbar transparente → bg-black/80 au scroll

---

## 2. Ce que contient notre documentation V5 actuelle

### 2.1 Product Brief

- Vision : école + cours + événements + communauté (Explore 3D)
- Top 3 : Catalogue cours, Calendrier événements, Landing + Explore 3D
- Backlog : contact, profs, paiement, blog

### 2.2 Tech Specs

- Stack : Next.js 15, Django, PostgreSQL (OK)
- Modules : Landing, Explore, Cours, Événements, Auth (OK pour Top 3)
- Entités : User, Course, Event, Organization (simplifié)
- Structure front : `app/`, `components/`, `lib/` (minimaliste)
- Structure back : users, courses, events, organisations (pas de shop, pas de core détaillé)

### 2.3 PRD

- Epics 1–5 : Landing, Catalogue cours, Calendrier événements, Explore 3D, Auth
- Epic 6 (backlog) : contact, profs, paiement, blog
- Périmètre hors V5 : mobile native, paiement (backlog)

### 2.4 User Stories

- ~20 stories sur les Top 3 + Auth
- Pas de stories pour : Formations, Trainings, Artistes, Théorie, Care, Projets, Shop/Boutique, Organisation (structure/pôles)

---

## 3. Analyse des écarts

### 3.1 Alignements (✅)

| Élément | V4 refacto | Docs V5 | Statut |
|---------|------------|--------|--------|
| Stack | Django + DRF, Next.js 15, PostgreSQL | Idem | ✅ |
| Top 3 priorités | Cours, Événements, Explore 3D | Idem | ✅ |
| Landing immersive | Oui | Oui | ✅ |
| Explore 3D (planètes) | OrganizationNode | Organization | ✅ (nom différent) |
| Rôles User | participant, artiste, admin | Idem | ✅ |
| Mobile-first, SEO | Oui | Oui | ✅ |
| Phasage par étapes | etapes/ | Évoqué | ✅ |

### 3.2 Écarts majeurs (à traiter)

| Écart | V4 refacto | Docs V5 | Recommandation |
|-------|------------|---------|----------------|
| **Portée fonctionnelle** | Formations, Trainings, Artistes, Théorie, Care, Projets, Shop, Organisation (structure/pôles) | Hors scope ou backlog minimal | Documenter le scope complet V4 comme « vision cible » et phaser : Phase 1 = Top 3 + Auth ; Phase 2+ = reste |
| **Structure frontend** | Groupes `(site)`, `(app)`, `(auth)`, `(dashboard)` ; components ui/shared/features | `app/`, `components/`, `lib/` seulement | Aligner `tech_specs` sur l'arborescence V4 |
| **Structure backend** | core, users, organization, courses, events, shop | users, courses, events, organisations | Ajouter core, shop ; renommer organisations → organization |
| **Modèle de données** | MCD complet (12 domaines, ~40 entités) | 5 entités (User, Course, Event, Organization, Venue) | Référencer le MCD V4 dans tech_specs ; distinguer Phase 1 vs complet |
| **Navbar / Menu** | MenuItem (API `GET /api/menu/items/`), 13 entrées + sous-menus | Non documenté | Ajouter dans tech_specs et PRD (ou user stories) |
| **Explore 3D détail** | Paramètres 3D (orbit_radius, planet_type, etc.), NodeEvent, overlay | Résumé « planètes » | Référencer 04-maquettes_ui_jour pour le détail |
| **Conventions** | 02-CONVENTIONS_V5 (vide) | tech_specs §4 | Fusionner ou compléter |
| **Étapes migration** | etapes/ avec index et modèle | Non documenté | Créer ou lier [10-etapes_v5.md](10-etapes_v5.md) |

### 3.3 Incohérences mineures

| Élément | Détail |
|---------|--------|
| **Organization vs Organisation** | V4 : `organization` (singulier) ; nous : `organisations` (pluriel). Harmoniser → `organization`. |
| **Shop / Boutique** | V4 : shop (backend), boutique (front) ; nous : backlog. À préciser si Phase 1 inclut ou non la boutique. |
| **NodeEvent vs Event** | V4 : NodeEvent (overlay noeud) vs Event (festivals, billetterie). Nous : Event seulement. À documenter. |

---

## 4. Recommandations

### 4.1 Court terme (avant déploiement Phase 1)

1. **Mettre à jour `02-tech_specs.md`** :
   - Aligner l'arborescence sur 01-arborescence (groupes de routes, structure components).
   - Référencer le MCD V4 (`refactorisation_v4/structure/02-mcd_modele_donnees.md`) pour le schéma complet.
   - Préciser : Phase 1 = entités core (User, Course, Event, OrganizationNode, Schedule, EventPass) ; Phase 2+ = Shop, Formations, etc.

2. **Mettre à jour `07-prd.md`** :
   - Ajouter une section « Vision complète V4 » (référence refactorisation_V5_Structuré).
   - Distinguer Phase 1 (Top 3 + Auth) et phases ultérieures (Formations, Trainings, Artistes, etc.).
   - Mentionner MenuItem / navbar dynamique (API menu).

3. **Créer ou lier les étapes** :
   - [10-etapes_v5.md](10-etapes_v5.md) (index + lien vers `refactorisation_v4/etapes/`).

### 4.2 Moyen terme (alignement complet)

4. **Copier ou référencer les fichiers V4** dans le projet V5 pour éviter la dispersion :
   - Option A : copier `refactorisation_V5_Structuré/*` dans `docs/refactorisation_v4/` (référence unique).
   - Option B : garder le chemin absolu V4 en référence (risque si le projet V4 est déplacé).

5. **Compléter `02-CONVENTIONS_V5.md`** dans V4 (ou dans docs V5) avec nommage, patterns API, etc.

---

## 5. Synthèse

| Critère | Statut |
|---------|--------|
| **Alignement Top 3 + Auth** | ✅ OK |
| **Stack technique** | ✅ OK |
| **Structure frontend/backend détaillée** | ⚠️ À mettre à jour dans tech_specs |
| **Modèle de données complet** | ⚠️ À référencer (MCD V4) |
| **Navbar / Menu dynamique** | ⚠️ Non documenté dans nos docs |
| **Scope complet (Formations, Shop, etc.)** | ⚠️ À documenter comme phases ultérieures |
| **Étapes de migration** | ⚠️ À lier ou créer |

**Conclusion :** La doc V5 actuelle couvre bien la Phase 1 (Top 3 + Auth) mais ne reflète pas toute la vision de la refactorisation V4. Pour déployer ce qui était prévu dans `refactorisation_V5_Structuré`, il faut aligner `tech_specs`, `prd` et éventuellement `product_brief` sur cette référence, en distinguant Phase 1 (immédiat) et phases ultérieures.

---

*Dernière mise à jour : 2025-02-10*
