# Récapitulatif temporaire — Actions réalisées et phases futures

**Fichier temporaire** : à supprimer ou fusionner dans la doc BMAD une fois la Phase 2 planifiée.  
*Dernière mise à jour : 2025-02-09*

---

## 1. Actions réalisées depuis le début

### 1.1 Documentation et cadrage (BMAD)
- Structure docs : tech_specs, api_docs, meetings, bugs, product_brief.
- Questionnaire V5 / BachataVibe intégré dans meetings et product_brief.
- Tech specs : stack (Next.js, Django, PostgreSQL), MCD Phase 1, conventions.
- PRD + user stories (6 epics, 20+ stories).
- Analyse alignement V4 ↔ V5, copie refactorisation_v4 (structure, étapes).
- Réorganisation : docs/bmad/ (01–10), docs/refactorisation_v4/, docs/README.

### 1.2 Phase 1 — Produit
- **Structure** : monorepo frontend/ (Next.js 15) + backend/ (Django), routes (main).
- **Landing + Navbar** : vidéo fond (YouTube), CTA, Navbar scroll + MobileNav.
- **Backend Phase 1** : config, apps core/users/organization/courses/events, modèles MCD, API GET menu/courses/events, load_initial_data.
- **Navbar dynamique** : menu piloté par API, fallback statique.
- **Pages Cours** : liste, filtres, détail par slug.
- **Pages Événements** : liste, filtres, détail par slug.
- **Explore 3D** : Three.js (planètes = noeuds), overlay détail, vue liste fallback.
- **Auth** : TokenAuthentication, /api/auth/login, page /login, Déconnexion Navbar/MobileNav.
- **Données démo** : load_demo_data (noeuds, cours, événements, NodeEvents) + doc.
- **SEO** : metadata, Open Graph, robots, sitemap, guide.
- **Accessibilité** : ARIA, focus, clavier, fallback Explore.

### 1.3 Déploiement et production
- **Préparation** : gunicorn, Procfile, CORS (production.py), doc déploiement.
- **CORS Vercel → Railway** : CORS_ALLOWED_ORIGIN_REGEXES pour \*.vercel.app.
- **Doc superuser Railway** : méthode SSH (railway ssh + createsuperuser dans le conteneur).
- **Checklist déploiement** : validée (repo à jour, backend Railway, frontend Vercel, CORS, tests, superuser créé).
- **Tests et mise en production** : OK — site en prod, pages (cours, événements, explore) chargent l’API, admin accessible.

---

## 2. Checklist déploiement (validée)

| Item | Statut |
|------|--------|
| Repo sur GitHub à jour | ✅ |
| Backend : Root = `backend`, gunicorn, variables (DJANGO_*, DB_*, ALLOWED_HOSTS, CORS) | ✅ |
| Backend : migrate + optionnel load_demo_data | ✅ |
| Frontend : Root = `frontend`, variables NEXT_PUBLIC_* | ✅ |
| CORS \*.vercel.app | ✅ |
| Test site Vercel → API Railway (cours, événements, explore) | ✅ |
| Superuser admin Railway (/admin/) | ✅ |

---

## 3. Phases futures

### 3.1 Interface 3D (Explore) — Prochaine action

**Cahier des charges (rappel)** — Sources : `docs/refactorisation_v4/structure/04-maquettes_ui_jour.md`, `05-maquettes_ui.md`, `docs/bmad/07-prd.md` (Epic 4), `08-user_stories.md` (US-4.1, US-4.2).

| Élément | Spécification |
|--------|----------------|
| **Scène** | Full viewport ; fond transparent (ou vidéo en fondue). Soleil central = noeud racine (ex. Capital of Fusion). **Planètes = noeuds d'organisation (OrganizationNode)** (ex. BachataVibe Paris, BachataVibe Lyon), pas les sections menu Cours/Événements/Boutique. Données : `GET /api/organization/nodes/` (paramètres 3D : `planet_color`, `orbit_radius`, `planet_scale`, `rotation_speed`, `orbit_phase`, etc.). |
| **Contrôles** | OrbitControls : rotation, zoom (scroll), déplacement (drag). Navigation fluide (NFR-3). |
| **Interactions** | **Hover** : highlight + tooltip (nom). **Premier clic** : zoom sur la planète. **Second clic / CTA « Détails »** : ouverture overlay (PlanetOverlay) avec fiche du noeud. |
| **Overlay (PlanetOverlay)** | Slide depuis la droite. Contenu : nom du noeud, image/vidéo, short_description, content, CTA (cta_text → cta_url), **NodeEvents** (prochains événements du noeud). Fermeture (bouton ✕, Escape). |
| **Options (panneau flottant)** | Orbits (affichage orbites), Debug, Figer planètes, Vidéo en fondue, Couleur planètes, Réglages globaux. |
| **Fallback** | Vue liste / arbre pour mobile et accessibilité (réf. 05-maquettes_ui : arbre textuel accordion). Pas de 3D lourde sur mobile ; fiche en modal. |
| **User stories** | US-4.1 : naviguer dans l’univers 3D (planètes = organisations). US-4.2 : clic/survol → infos (nom, résumé), lien vers organisation/cours/événements. |
| **Stack** | Three.js (R3F possible). Backend : OrganizationNode avec champs 3D + NodeEvent pour l’overlay. |

- **Référence code actuelle** : `frontend/src/app/(main)/explore/`, composants 3D et `PlanetOverlay`.
- **Pistes d’évolution** : rendu (lumière, textures, orbites), UX (légende, options panneau), perfs (LOD), contenu (liens cours/événements depuis l’overlay).

### 3.2 Optionnel avant Phase 2
- **Domaine perso** : configurer capitaloffusion.fr (ou autre) sur Vercel + Railway, ajouter dans CORS_ALLOWED_ORIGINS.
- **Renforcement accessibilité** : piège de focus, tests TA (lecteurs d’écran).

### 3.3 Phase 2 — Produit (à prioriser après 3D)
- **Boutique** : catalogue, panier, paiement (à préciser dans PRD / product_brief).
- **Formations** : parcours, inscriptions, suivi (à préciser).
- **Autres** : selon priorisation produit (voir docs/bmad/06-product_brief.md, 07-prd.md).

### 3.4 Suite technique possible
- Inscription utilisateur (register) côté API + front.
- Gestion des rôles (participant, artiste, admin) dans l’UI.
- Pages /organisation, /boutique (squelettes déjà en routes).

---

## 4. Références

- **Master Log** : `docs/bmad/01-project_log.md`
- **Déploiement** : `docs/explication/deploiement.md`
- **Étapes Phase 1** : `docs/bmad/10-etapes_v5.md`
- **Product brief / PRD** : `docs/bmad/06-product_brief.md`, `07-prd.md`

---

*Ce fichier peut être supprimé ou intégré dans la doc BMAD quand la Phase 2 est formalisée.*
