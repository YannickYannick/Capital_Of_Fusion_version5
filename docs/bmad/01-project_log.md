# 📋 Master Log — Projet Site Bachata V5

**Source de vérité unique** pour toutes les actions du projet (protocole BMAD).

---

## Entrées

| Date / Heure | Action | Objectif / Résultat |
|--------------|--------|----------------------|
| [2025-02-10] Initialisation | Démarrage protocole BMAD | Context Scan racine effectué ; dossier `./docs/` vérifié (existant) ; `project_log.md` initialisé. |
| [2025-02-10] Starting Task | Option A — Structure docs | Objectif : créer squelettes tech_specs, api_docs, meetings + dossier bugs. |
| [2025-02-10] Completed Task | Option A — Structure docs | Créés : `./docs/tech_specs.md`, `./docs/api_docs.md`, `./docs/meetings.md`, `./docs/bugs/` (.gitkeep). Tous les .md restent dans `./docs/`. |
| [2025-02-10] Starting Task | Option B — Définition produit | Objectif : structurer `meetings.md` et créer un `product_brief.md` pour le site Bachata V5. |
| [2025-02-10] Completed Task | Option B — Définition produit | Structuré : entrée de définition produit dans `meetings.md` ; créé : `./docs/product_brief.md` (squelette). |
| [2025-02-10] Starting Task | Questionnaire V5 — BachataVibe | Objectif : intégrer les réponses au questionnaire (objectif, cible, top 3 features, contraintes) dans meetings.md et product_brief.md. |
| [2025-02-10] Completed Task | Questionnaire V5 — BachataVibe | Réponses intégrées dans `meetings.md` (entrée « Définition produit ») et `product_brief.md` (sections 1–6 complétées). Source : analyse V4. |
| [2025-02-10] Starting Task | Option C — Tech specs | Objectif : remplir `tech_specs.md` (stack, architecture, modèles, conventions) à partir du Product Brief. |
| [2025-02-10] Completed Task | Option C — Tech specs | Rempli : `./docs/tech_specs.md` — stack (Next.js, Django, PostgreSQL), modules (Landing, Explore, Cours, Événements), entités (User, Course, Event, Organization), conventions. |
| [2025-02-10] Starting Task | PRD + User Stories | Objectif : créer `prd.md` (exigences, epics) et `user_stories.md` (stories prêtes pour dev). |
| [2025-02-10] Completed Task | PRD + User Stories | Créés : `./docs/prd.md` (6 epics, FR, NFR) et `./docs/user_stories.md` (20+ stories avec AC, format En tant que…). |
| [2025-02-10] Starting Task | Analyse alignement V4↔V5 | Objectif : comparer docs V5 avec refactorisation_V5_Structuré (V4) avant déploiement. |
| [2025-02-10] Completed Task | Analyse alignement V4↔V5 | Créé : `./docs/analyse_alignement_V4_V5.md`. Mis à jour : `tech_specs.md` (structure, MCD, design system), `prd.md` (phasage, Navbar, Explore), `product_brief.md` (vision complète). Créé : `./docs/etapes_v5.md`. |
| [2025-02-10] Starting Task | Copie hybride refactorisation_v4 | Objectif : copier structure/ et etapes/ dans docs/refactorisation_v4/ avec questions de challenge avant chaque fichier. |
| [2025-02-10] Copie 01-ARBORESCENCE_V5 | Adapté (1 layout, monorepo) → `docs/refactorisation_v4/structure/01-ARBORESCENCE_V5.md`. Décisions : 1 layout unique, frontend/ + backend/. |
| [2025-02-10] Copie 02-CONVENTIONS_V5 | Non copié (option D) — conventions déjà dans tech_specs. |
| [2025-02-10] Copie 03-MCD_MODELE_DONNEES | Copié avec table Phase 1 vs Phase 2 → `docs/refactorisation_v4/structure/03-MCD_MODELE_DONNEES.md`. |
| [2025-02-10] Copie 04-MAQUETTES_ET_WIREFRAMES + 08-MAQUETTES_UI | Copié 08 (V4) → `docs/refactorisation_v4/08-MAQUETTES_UI.md`. 04 copié avec ref. `../08-MAQUETTES_UI.md`, mention (main) au lieu de (site)/(app). |
| [2025-02-10] Copie 05-MAQUETTES_UI_A_JOUR | Copié avec routes (site) → (main), ref. 08 → `../08-MAQUETTES_UI.md` → `docs/refactorisation_v4/structure/05-MAQUETTES_UI_A_JOUR.md`. |
| [2025-02-10] Copie etapes/ | `00-INDEX_ETAPES.md` et `etape_01_exemple_structure_frontend.md` copiés, adaptés à (main) et arborescence V5 → `docs/refactorisation_v4/etapes/`. |
| [2025-02-10] Completed Task | Copie hybride refactorisation_v4 | Tous les fichiers validés copiés/adaptés. Réf. `docs/refactorisation_v4/sources_refacto.md`. |
| [2025-02-10] Completed Task | Réorganisation docs | Titres homogènes (01–05), numérotation structure/etapes, sources_refacto → refactorisation_v4, docs/README.md créé, liens mis à jour. |
| [2025-02-10] Completed Task | Réorganisation BMAD | Fichiers BMAD numérotés (01–10) et regroupés dans `docs/bmad/`. |
| [2025-02-10] Git | Repo initialisé, commit : feat: reorganisation docs BMAD. Remote non configuré (push à faire après `git remote add`). |
| [2025-02-10] Starting Task | Étape 1 — Structure frontend | Objectif : créer monorepo frontend/, structure Next.js 15 (main), routes squelettes. |
| [2025-02-10] Completed Task | Étape 1 — Structure frontend | Next.js 15, Tailwind, layout (main), routes /, /explore, /cours, /evenements, /boutique, /organisation, /login. Composant YouTubeVideoBackground pour vidéos fond. tech_specs : vidéos = YouTube. Build OK. |
| [2025-02-10] Starting Task | Landing + Navbar | Objectif : Navbar (transparent → opaque), landing immersive (maquette). |
| [2025-02-10] Completed Task | Landing + Navbar | Navbar avec scroll, MobileNav hamburger, landing gradient + CTA, NEXT_PUBLIC_YOUTUBE_VIDEO_ID. |
| [2025-02-10] Starting Task | Backend Django Phase 1 | Objectif : projet config, apps core/users/organization/courses/events, modèles MCD Phase 1, API menu/courses/events (lecture seule), fixtures, doc. |
| [2025-02-10] Completed Task | Backend Django Phase 1 | Projet Django dans `backend/` (config, settings base/local/production), apps core, users, organization, courses, events ; modèles BaseModel, DanceStyle, Level, DanceProfession, SiteConfiguration, MenuItem, User, OrganizationNode, OrganizationRole, UserOrganizationRole, NodeEvent, Course, Schedule, Enrollment, Event, EventPass, Registration ; API GET /api/menu/items/, /api/courses/, /api/events/ avec filtres ; commande `load_initial_data` ; tech_specs, api_docs, project_log et .gitignore mis à jour. |
| [2025-02-10] Starting Task | Prochaines étapes (Navbar dynamique, Cours, Événements, Explore 3D, Auth) | Objectif : implémenter les 5 étapes front + API (détail par slug, organization/nodes, auth token). |
| [2025-02-10] Completed Task | Navbar dynamique | Front : GET /api/menu/items/, NEXT_PUBLIC_API_URL, Navbar et MobileNav pilotés par l’API ; fallback liens statiques si API indisponible. |
| [2025-02-10] Completed Task | Pages Cours | Backend : GET /api/courses/<slug>/ ; front : /cours (liste, filtres style/niveau), /cours/[slug] (détail). |
| [2025-02-10] Completed Task | Pages Événements | Backend : GET /api/events/<slug>/ ; front : /evenements (liste, filtres type/upcoming), /evenements/[slug] (détail). |
| [2025-02-10] Completed Task | Explore 3D | Backend : GET /api/organization/nodes/ et nodes/<slug>/ ; front : scène Three.js (planètes = noeuds), overlay détail (PlanetOverlay + NodeEvents), fallback vue liste. |
| [2025-02-10] Completed Task | Auth base | Backend : TokenAuthentication, POST /api/auth/login/, logout, GET /api/auth/me/ ; front : page /login, stockage token (localStorage), Déconnexion dans Navbar/MobileNav. api_docs mis à jour. |
| [2025-02-10] Starting Task | Données démo | Objectif : créer des données démo (noeuds, cours, événements, NodeEvents) et documenter. |
| [2025-02-10] Completed Task | Données démo | Commande `load_demo_data` : 3 noeuds (Capital of Fusion, Paris, Lyon), 3 NodeEvents, 3 cours + horaires, 3 événements + passes. Doc : `docs/explication/donnees_demo.md`, `backend/README.md` (section Données démo). |
| [2025-02-10] Starting Task | SEO | Objectif : metadata par page, Open Graph, robots.txt, sitemap, guide explicatif. |
| [2025-02-10] Completed Task | SEO | Layout racine : metadataBase, title template, openGraph, twitter, robots. Layouts (cours, evenements, explore, login) + landing : metadata. generateMetadata sur /cours/[slug] et /evenements/[slug]. robots.ts (disallow /login, sitemap), sitemap.ts (pages + cours + events). NEXT_PUBLIC_SITE_URL dans .env.example. Doc : `docs/explication/seo-guide.md`. |
| [2025-02-10] Completed Task | Mise à jour étapes Phase 1 | `docs/bmad/10-etapes_v5.md` : index des étapes 1–10 marquées « Fait », section « Suite après Phase 1 » (accessibilité, déploiement, Phase 2). |
| [2025-02-10] Starting Task | Accessibilité | Objectif : contrastes (focus visible), clavier (Escape, focus), ARIA, fallback Explore 3D. |
| [2025-02-10] Completed Task | Accessibilité | Navbar : aria-label nav, focus-visible ring sur liens/boutons, aria-haspopup/aria-label sur groupes dropdown. MobileNav : aria-expanded, aria-controls, aria-label dynamique (Ouvrir/Fermer menu), focus ring, aria-label Déconnexion/Connexion. Explore : groupe toggle aria-label, aria-pressed sur boutons Vue 3D/liste, sr-only hint « Vue liste pour clavier/TA », liste avec aria-label et aria-label sur boutons noeuds, vue 3D avec aria-hidden + sr-only fallback. PlanetOverlay : aria-modal, fermeture Escape, focus sur bouton fermer à l’ouverture, aria-label liens événements. Pas de piège de focus complet (à renforcer plus tard si besoin). |
| [2025-02-10] Starting Task | Préparation déploiement | Objectif : backend prêt prod (gunicorn, CORS, Procfile) + guide pas à pas. |
| [2025-02-10] Completed Task | Préparation déploiement | Backend : gunicorn + psycopg dans requirements.txt ; Procfile (gunicorn bind $PORT) ; production.py : CORS_ALLOWED_ORIGINS depuis env. Doc : `docs/explication/deploiement.md` (étapes Vercel + Railway/Render, variables, migrations, CORS, checklist). Lien depuis `hebergement.md`. |
| [2026-02-10] Starting Task | CORS Vercel → Railway | Objectif : corriger blocage CORS (front Vercel appelant API Railway) — « No Access-Control-Allow-Origin header ». |
| [2026-02-10] Completed Task | CORS Vercel → Railway | production.py : ajout CORS_ALLOWED_ORIGIN_REGEXES pour autoriser tout \*.vercel.app (preview + prod). Doc déploiement : étape 3 et tableau variables mises à jour (CORS optionnel pour Vercel). project_log mis à jour. |
| [2025-02-09] Completed Task | Doc superuser Railway + Méthode SSH | `docs/explication/deploiement.md` : ajout méthode 3 « SSH dans le conteneur » pour créer un superuser Django sur Railway (`railway ssh --project/--environment/--service`, puis `python manage.py createsuperuser` dans le conteneur), avec exemple de commande. Unification : seul Master Log conservé (`docs/bmad/01-project_log.md`), suppression de `docs/project_log.md`. |
| [2025-02-09] Validation | Checklist déploiement + Tests prod | Checklist rapide dans `deploiement.md` cochée (repo, backend, frontend, CORS, tests, superuser). Création `docs/RECAP_TEMPORAIRE_actions_et_phases.md` : récap actions depuis le début + checklist validée + phases futures (Phase 2 : Boutique, Formations ; optionnel domaine perso). Prêt pour suite produit. |
| [2025-02-09] Starting Task | Interface 3D Explore (feat/explore-3d) | Objectif : appliquer le CDC — soleil central (noeud ROOT), orbites visibles, hover (highlight + tooltip), clic → overlay. |
| [2025-02-09] Completed Task | Interface 3D Explore | ExploreScene : séparation rootNode (type ROOT) = Sun central avec emissive ; orbitNodes = planètes en orbite. Orbites dessinées (Line drei). Hover : scale + emissive + tooltip Html (nom). Lumière renforcée (3 pointLights). Build OK. |
| [2026-02-10] Starting Task | Connexion Google (OAuth) | Objectif : lier compte utilisateur à Gmail via « Se connecter avec Google ». |
| [2026-02-10] Completed Task | Connexion Google (OAuth) | Backend : `POST /api/auth/google/` (vérif id_token avec google-auth), get_or_create User par email, même token API. Frontend : @react-oauth/google, bouton sur /login si NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID. Doc : `docs/explication/auth-google-avantages-inconvenients.md`, api_docs, .env.example. |
| [2025-02-09] Completed Task | Explore 3D — options et zoom | Panneau d’options (Orbites on/off, Figer planètes). Premier clic planète/soleil = zoom caméra (CameraAnimator + lerp) ; boutons « Détails » (overlay) et « Vue d’ensemble ». Build OK. |
| [2026-02-21 15:47] Starting Task | Explore 3D — Finalisation (Phase 3.1) | Objectif : Améliorer le rendu visuel, l'UX du panneau/légendes, les performances (LOD) et le vrai contenu de la vue 3D. |
| [2026-02-21 16:21] Bug Fix | CORS Ports frontend | Ajout des ports 3001, 3002 et 3003 dans `CORS_ALLOWED_ORIGINS` (`backend/config/settings/base.py`) pour résoudre le blocage au lancement de Next.js sur ces ports alternatifs. |
| [2026-02-21 16:22] Completed Task | Explore 3D — Finalisation (Phase 3.1) | Rendu des planètes affiné (matériaux standard avec rugosité, lumières revues), composant d'UI passés en Glassmorphism (panneau d'options, tooltip). Overlay connecté aux requêtes contextuelles `/cours?organization=ID`. Verification visuelle effectuée. |
| [2026-02-21 16:34] Starting Task | Phase 2 — Squelettes Routing & Menus | Objectif : Implémenter toute la structure de routes V5 telle que décrite dans `04-maquettes_ui_jour.md`. |
| [2026-02-21 16:38] Completed Task | Phase 2 — Squelettes Routing & Menus | Backend : Mise à jour du script `load_initial_data` pour peupler récursivement +14 entrées et leurs sous-menus. Frontend : Script python utilisé pour générer 32 pages squelettes (Formations, Théorie, Artistes, Shop, etc.) dans `app/(main)`, adaptation de `Navbar.tsx` en `xl` pour les grands menus. Commits validés. |
| [2026-03-05 21:00] Starting Task | Application Artistes & Config 3D | Intégration complète : backend (models, views), frontend (annuaire, profils) et système de presets 3D Explore. |
| [2026-03-05 22:15] Incident Git | Verrou index.lock & Data Loss | Bug Git sur Windows entraînant la suppression temporaire de fichiers. Restauration manuelle effectuée par l'agent AI. |
| [2026-03-05 22:30] Completed Task | Application Artistes & Config 3D | Succès du push forcé sur `main`. Preset 1 initialisé, artistes démo chargés, 3D fonctionnelle avec réglages Admin. |
| [2026-03-05 22:50] Starting Task | Bonnes Pratiques & Workflow | Création `docs/bonnes_pratiques/`, rédaction post-mortem incident Git dans `docs/bugs/`, mise à jour `.cursorrules` (Section 6). |
| [2026-03-05 23:05] Completed Task | Bonnes Pratiques & Workflow | Documentation structurée, règles BMAD mises à jour pour prévenir les verrous Git et erreurs de workspace sur Windows. |

*Dernière mise à jour : 2026-03-05*
