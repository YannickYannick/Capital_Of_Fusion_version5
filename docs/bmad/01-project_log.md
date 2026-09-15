# ?? Master Log ? Projet Site Bachata V5

**Source de v?rit? unique** pour toutes les actions du projet (protocole BMAD).

---

## Entr?es

| Date / Heure | Action | Objectif / R?sultat |
|--------------|--------|----------------------|
| [2025-02-10] Initialisation | D?marrage protocole BMAD | Context Scan racine effectu? ; dossier `./docs/` v?rifi? (existant) ; `project_log.md` initialis?. |
| [2025-02-10] Starting Task | Option A ? Structure docs | Objectif : cr?er squelettes tech_specs, api_docs, meetings + dossier bugs. |
| [2025-02-10] Completed Task | Option A ? Structure docs | Cr??s : `./docs/tech_specs.md`, `./docs/api_docs.md`, `./docs/meetings.md`, `./docs/bugs/` (.gitkeep). Tous les .md restent dans `./docs/`. |
| [2025-02-10] Starting Task | Option B ? D?finition produit | Objectif : structurer `meetings.md` et cr?er un `product_brief.md` pour le site Bachata V5. |
| [2025-02-10] Completed Task | Option B ? D?finition produit | Structur? : entr?e de d?finition produit dans `meetings.md` ; cr?? : `./docs/product_brief.md` (squelette). |
| [2025-02-10] Starting Task | Questionnaire V5 ? BachataVibe | Objectif : int?grer les r?ponses au questionnaire (objectif, cible, top 3 features, contraintes) dans meetings.md et product_brief.md. |
| [2025-02-10] Completed Task | Questionnaire V5 ? BachataVibe | R?ponses int?gr?es dans `meetings.md` (entr?e ? D?finition produit ?) et `product_brief.md` (sections 1?6 compl?t?es). Source : analyse V4. |
| [2025-02-10] Starting Task | Option C ? Tech specs | Objectif : remplir `tech_specs.md` (stack, architecture, mod?les, conventions) ? partir du Product Brief. |
| [2025-02-10] Completed Task | Option C ? Tech specs | Rempli : `./docs/tech_specs.md` ? stack (Next.js, Django, PostgreSQL), modules (Landing, Explore, Cours, ?v?nements), entit?s (User, Course, Event, Organization), conventions. |
| [2025-02-10] Starting Task | PRD + User Stories | Objectif : cr?er `prd.md` (exigences, epics) et `user_stories.md` (stories pr?tes pour dev). |
| [2025-02-10] Completed Task | PRD + User Stories | Cr??s : `./docs/prd.md` (6 epics, FR, NFR) et `./docs/user_stories.md` (20+ stories avec AC, format En tant que?). |
| [2025-02-10] Starting Task | Analyse alignement V4?V5 | Objectif : comparer docs V5 avec refactorisation_V5_Structur? (V4) avant d?ploiement. |
| [2025-02-10] Completed Task | Analyse alignement V4?V5 | Cr?? : `./docs/analyse_alignement_V4_V5.md`. Mis ? jour : `tech_specs.md` (structure, MCD, design system), `prd.md` (phasage, Navbar, Explore), `product_brief.md` (vision compl?te). Cr?? : `./docs/etapes_v5.md`. |
| [2025-02-10] Starting Task | Copie hybride refactorisation_v4 | Objectif : copier structure/ et etapes/ dans docs/refactorisation_v4/ avec questions de challenge avant chaque fichier. |
| [2025-02-10] Copie 01-ARBORESCENCE_V5 | Adapt? (1 layout, monorepo) ? `docs/refactorisation_v4/structure/01-ARBORESCENCE_V5.md`. D?cisions : 1 layout unique, frontend/ + backend/. |
| [2025-02-10] Copie 02-CONVENTIONS_V5 | Non copi? (option D) ? conventions d?j? dans tech_specs. |
| [2025-02-10] Copie 03-MCD_MODELE_DONNEES | Copi? avec table Phase 1 vs Phase 2 ? `docs/refactorisation_v4/structure/03-MCD_MODELE_DONNEES.md`. |
| [2025-02-10] Copie 04-MAQUETTES_ET_WIREFRAMES + 08-MAQUETTES_UI | Copi? 08 (V4) ? `docs/refactorisation_v4/08-MAQUETTES_UI.md`. 04 copi? avec ref. `../08-MAQUETTES_UI.md`, mention (main) au lieu de (site)/(app). |
| [2025-02-10] Copie 05-MAQUETTES_UI_A_JOUR | Copi? avec routes (site) ? (main), ref. 08 ? `../08-MAQUETTES_UI.md` ? `docs/refactorisation_v4/structure/05-MAQUETTES_UI_A_JOUR.md`. |
| [2025-02-10] Copie etapes/ | `00-INDEX_ETAPES.md` et `etape_01_exemple_structure_frontend.md` copi?s, adapt?s ? (main) et arborescence V5 ? `docs/refactorisation_v4/etapes/`. |
| [2025-02-10] Completed Task | Copie hybride refactorisation_v4 | Tous les fichiers valid?s copi?s/adapt?s. R?f. `docs/refactorisation_v4/sources_refacto.md`. |
| [2025-02-10] Completed Task | R?organisation docs | Titres homog?nes (01?05), num?rotation structure/etapes, sources_refacto ? refactorisation_v4, docs/README.md cr??, liens mis ? jour. |
| [2025-02-10] Completed Task | R?organisation BMAD | Fichiers BMAD num?rot?s (01?10) et regroup?s dans `docs/bmad/`. |
| [2025-02-10] Git | Repo initialis?, commit : feat: reorganisation docs BMAD. Remote non configur? (push ? faire apr?s `git remote add`). |
| [2025-02-10] Starting Task | ?tape 1 ? Structure frontend | Objectif : cr?er monorepo frontend/, structure Next.js 15 (main), routes squelettes. |
| [2025-02-10] Completed Task | ?tape 1 ? Structure frontend | Next.js 15, Tailwind, layout (main), routes /, /explore, /cours, /evenements, /boutique, /organisation, /login. Composant YouTubeVideoBackground pour vid?os fond. tech_specs : vid?os = YouTube. Build OK. |
| [2025-02-10] Starting Task | Landing + Navbar | Objectif : Navbar (transparent ? opaque), landing immersive (maquette). |
| [2025-02-10] Completed Task | Landing + Navbar | Navbar avec scroll, MobileNav hamburger, landing gradient + CTA, NEXT_PUBLIC_YOUTUBE_VIDEO_ID. |
| [2025-02-10] Starting Task | Backend Django Phase 1 | Objectif : projet config, apps core/users/organization/courses/events, mod?les MCD Phase 1, API menu/courses/events (lecture seule), fixtures, doc. |
| [2025-02-10] Completed Task | Backend Django Phase 1 | Projet Django dans `backend/` (config, settings base/local/production), apps core, users, organization, courses, events ; mod?les BaseModel, DanceStyle, Level, DanceProfession, SiteConfiguration, MenuItem, User, OrganizationNode, OrganizationRole, UserOrganizationRole, NodeEvent, Course, Schedule, Enrollment, Event, EventPass, Registration ; API GET /api/menu/items/, /api/courses/, /api/events/ avec filtres ; commande `load_initial_data` ; tech_specs, api_docs, project_log et .gitignore mis ? jour. |
| [2025-02-10] Starting Task | Prochaines ?tapes (Navbar dynamique, Cours, ?v?nements, Explore 3D, Auth) | Objectif : impl?menter les 5 ?tapes front + API (d?tail par slug, organization/nodes, auth token). |
| [2025-02-10] Completed Task | Navbar dynamique | Front : GET /api/menu/items/, NEXT_PUBLIC_API_URL, Navbar et MobileNav pilot?s par l?API ; fallback liens statiques si API indisponible. |
| [2025-02-10] Completed Task | Pages Cours | Backend : GET /api/courses/<slug>/ ; front : /cours (liste, filtres style/niveau), /cours/[slug] (d?tail). |
| [2025-02-10] Completed Task | Pages ?v?nements | Backend : GET /api/events/<slug>/ ; front : /evenements (liste, filtres type/upcoming), /evenements/[slug] (d?tail). |
| [2025-02-10] Completed Task | Explore 3D | Backend : GET /api/organization/nodes/ et nodes/<slug>/ ; front : sc?ne Three.js (plan?tes = noeuds), overlay d?tail (PlanetOverlay + NodeEvents), fallback vue liste. |
| [2025-02-10] Completed Task | Auth base | Backend : TokenAuthentication, POST /api/auth/login/, logout, GET /api/auth/me/ ; front : page /login, stockage token (localStorage), D?connexion dans Navbar/MobileNav. api_docs mis ? jour. |
| [2025-02-10] Starting Task | Donn?es d?mo | Objectif : cr?er des donn?es d?mo (noeuds, cours, ?v?nements, NodeEvents) et documenter. |
| [2025-02-10] Completed Task | Donn?es d?mo | Commande `load_demo_data` : 3 noeuds (Capital of Fusion, Paris, Lyon), 3 NodeEvents, 3 cours + horaires, 3 ?v?nements + passes. Doc : `docs/explication/donnees_demo.md`, `backend/README.md` (section Donn?es d?mo). |
| [2025-02-10] Starting Task | SEO | Objectif : metadata par page, Open Graph, robots.txt, sitemap, guide explicatif. |
| [2025-02-10] Completed Task | SEO | Layout racine : metadataBase, title template, openGraph, twitter, robots. Layouts (cours, evenements, explore, login) + landing : metadata. generateMetadata sur /cours/[slug] et /evenements/[slug]. robots.ts (disallow /login, sitemap), sitemap.ts (pages + cours + events). NEXT_PUBLIC_SITE_URL dans .env.example. Doc : `docs/explication/seo-guide.md`. |
| [2025-02-10] Completed Task | Mise ? jour ?tapes Phase 1 | `docs/bmad/10-etapes_v5.md` : index des ?tapes 1?10 marqu?es ? Fait ?, section ? Suite apr?s Phase 1 ? (accessibilit?, d?ploiement, Phase 2). |
| [2025-02-10] Starting Task | Accessibilit? | Objectif : contrastes (focus visible), clavier (Escape, focus), ARIA, fallback Explore 3D. |
| [2025-02-10] Completed Task | Accessibilit? | Navbar : aria-label nav, focus-visible ring sur liens/boutons, aria-haspopup/aria-label sur groupes dropdown. MobileNav : aria-expanded, aria-controls, aria-label dynamique (Ouvrir/Fermer menu), focus ring, aria-label D?connexion/Connexion. Explore : groupe toggle aria-label, aria-pressed sur boutons Vue 3D/liste, sr-only hint ? Vue liste pour clavier/TA ?, liste avec aria-label et aria-label sur boutons noeuds, vue 3D avec aria-hidden + sr-only fallback. PlanetOverlay : aria-modal, fermeture Escape, focus sur bouton fermer ? l?ouverture, aria-label liens ?v?nements. Pas de pi?ge de focus complet (? renforcer plus tard si besoin). |
| [2025-02-10] Starting Task | Pr?paration d?ploiement | Objectif : backend pr?t prod (gunicorn, CORS, Procfile) + guide pas ? pas. |
| [2025-02-10] Completed Task | Pr?paration d?ploiement | Backend : gunicorn + psycopg dans requirements.txt ; Procfile (gunicorn bind $PORT) ; production.py : CORS_ALLOWED_ORIGINS depuis env. Doc : `docs/explication/deploiement.md` (?tapes Vercel + Railway/Render, variables, migrations, CORS, checklist). Lien depuis `hebergement.md`. |
| [2026-02-10] Starting Task | CORS Vercel ? Railway | Objectif : corriger blocage CORS (front Vercel appelant API Railway) ? ? No Access-Control-Allow-Origin header ?. |
| [2026-02-10] Completed Task | CORS Vercel ? Railway | production.py : ajout CORS_ALLOWED_ORIGIN_REGEXES pour autoriser tout \*.vercel.app (preview + prod). Doc d?ploiement : ?tape 3 et tableau variables mises ? jour (CORS optionnel pour Vercel). project_log mis ? jour. |
| [2025-02-09] Completed Task | Doc superuser Railway + M?thode SSH | `docs/explication/deploiement.md` : ajout m?thode 3 ? SSH dans le conteneur ? pour cr?er un superuser Django sur Railway (`railway ssh --project/--environment/--service`, puis `python manage.py createsuperuser` dans le conteneur), avec exemple de commande. Unification : seul Master Log conserv? (`docs/bmad/01-project_log.md`), suppression de `docs/project_log.md`. |
| [2025-02-09] Validation | Checklist d?ploiement + Tests prod | Checklist rapide dans `deploiement.md` coch?e (repo, backend, frontend, CORS, tests, superuser). Cr?ation `docs/RECAP_TEMPORAIRE_actions_et_phases.md` : r?cap actions depuis le d?but + checklist valid?e + phases futures (Phase 2 : Boutique, Formations ; optionnel domaine perso). Pr?t pour suite produit. |
| [2025-02-09] Starting Task | Interface 3D Explore (feat/explore-3d) | Objectif : appliquer le CDC ? soleil central (noeud ROOT), orbites visibles, hover (highlight + tooltip), clic ? overlay. |
| [2025-02-09] Completed Task | Interface 3D Explore | ExploreScene : s?paration rootNode (type ROOT) = Sun central avec emissive ; orbitNodes = plan?tes en orbite. Orbites dessin?es (Line drei). Hover : scale + emissive + tooltip Html (nom). Lumi?re renforc?e (3 pointLights). Build OK. |
| [2026-02-10] Starting Task | Connexion Google (OAuth) | Objectif : lier compte utilisateur ? Gmail via ? Se connecter avec Google ?. |
| [2026-02-10] Completed Task | Connexion Google (OAuth) | Backend : `POST /api/auth/google/` (v?rif id_token avec google-auth), get_or_create User par email, m?me token API. Frontend : @react-oauth/google, bouton sur /login si NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID. Doc : `docs/explication/auth-google-avantages-inconvenients.md`, api_docs, .env.example. |
| [2025-02-09] Completed Task | Explore 3D ? options et zoom | Panneau d?options (Orbites on/off, Figer plan?tes). Premier clic plan?te/soleil = zoom cam?ra (CameraAnimator + lerp) ; boutons ? D?tails ? (overlay) et ? Vue d?ensemble ?. Build OK. |
| [2026-02-21 15:47] Starting Task | Explore 3D ? Finalisation (Phase 3.1) | Objectif : Am?liorer le rendu visuel, l'UX du panneau/l?gendes, les performances (LOD) et le vrai contenu de la vue 3D. |
| [2026-02-21 16:21] Bug Fix | CORS Ports frontend | Ajout des ports 3001, 3002 et 3003 dans `CORS_ALLOWED_ORIGINS` (`backend/config/settings/base.py`) pour r?soudre le blocage au lancement de Next.js sur ces ports alternatifs. |
| [2026-02-21 16:22] Completed Task | Explore 3D ? Finalisation (Phase 3.1) | Rendu des plan?tes affin? (mat?riaux standard avec rugosit?, lumi?res revues), composant d'UI pass?s en Glassmorphism (panneau d'options, tooltip). Overlay connect? aux requ?tes contextuelles `/cours?organization=ID`. Verification visuelle effectu?e. |
| [2026-02-21 16:34] Starting Task | Phase 2 ? Squelettes Routing & Menus | Objectif : Impl?menter toute la structure de routes V5 telle que d?crite dans `04-maquettes_ui_jour.md`. |
| [2026-02-21 16:38] Completed Task | Phase 2 ? Squelettes Routing & Menus | Backend : Mise ? jour du script `load_initial_data` pour peupler r?cursivement +14 entr?es et leurs sous-menus. Frontend : Script python utilis? pour g?n?rer 32 pages squelettes (Formations, Th?orie, Artistes, Shop, etc.) dans `app/(main)`, adaptation de `Navbar.tsx` en `xl` pour les grands menus. Commits valid?s. |
| [2026-03-05 21:00] Starting Task | Application Artistes & Config 3D | Int?gration compl?te : backend (models, views), frontend (annuaire, profils) et syst?me de presets 3D Explore. |
| [2026-03-05 22:15] Incident Git | Verrou index.lock & Data Loss | Bug Git sur Windows entra?nant la suppression temporaire de fichiers. Restauration manuelle effectu?e par l'agent AI. |
| [2026-03-05 22:30] Completed Task | Application Artistes & Config 3D | Succ?s du push forc? sur `main`. Preset 1 initialis?, artistes d?mo charg?s, 3D fonctionnelle avec r?glages Admin. |
| [2026-03-05 22:50] Starting Task | Bonnes Pratiques & Workflow | Cr?ation `docs/bonnes_pratiques/`, r?daction post-mortem incident Git dans `docs/bugs/`, mise ? jour `.cursorrules` (Section 6). |
| [2026-03-05 23:05] Completed Task | Bonnes Pratiques & Workflow | Documentation structur?e, r?gles BMAD mises ? jour pour pr?venir les verrous Git et erreurs de workspace sur Windows. |
| [2026-03-07] Nettoyage & doc | Fichiers debug exclus du d?p?t (`.gitignore` : `backend/error.txt`, `backend/migrate_err.txt`). |
| [2026-03-07] Doc par feature | Cr?ation `docs/features/` : README (index), `explore-presets.md`, `landing-config.md`, `navbar-dashboard.md`. R?f?rence depuis `docs/README.md`. |
| [2026-03-07] API docs | Mise ? jour `docs/bmad/03-api_docs.md` : section Core (GET `/api/config/`, CRUD `/api/core/presets/`). |
| [2026-03-07] Trace session | Fichier `docs/history/trace_deduction_cursor_vs_antigravity_2026-03-07.md` (comparaison d?duction Cursor / conv Antigravity). |
| [2026-05-03] Starting Task | Explore mobile carrousel 2.5D | Objectif : layout compact sans WebGL, carrousel DOM (scroll-snap + perspective), m?mes n?uds orbite + PlanetOverlay ; deep link `?node=` ; pr?fetch 3D d?sactiv? sur compact. |
| [2026-05-03] Completed Task | Explore mobile carrousel 2.5D | Fichiers : `useExploreCompactLayout.ts`, `exploreOrbitNodes.ts`, `ExploreMobileCarousel.tsx`, `PlanetCardSphere.tsx`, branche dans `explore/page.tsx`, `usePrefetchExplore.ts` ; cl?s i18n `explore.mobileCarousel` (fr/en/es). |
| [2026-05-03] Starting Task | Admin Django ? Notre programme | Objectif : fieldset + aide admin, seed DB align? sur `defaultMarkdown` i18n (FR/EN/ES). |
| [2026-05-03] Completed Task | Admin Django ? Notre programme | `admin.py` : fieldset d?di? + description (tabs FR/EN/ES, repli Next si vide). `models.py` : help_text champ. Migrations `0028_seed_festival_notre_programme_markdown` (sidecars `.md` depuis messages) + `0029_alter_notre_programme_help_text`. |
| [2026-05-03] Completed Task | Notre programme ? Markdown repliable | `EditableConfigMarkdownPage` : prop `collapsibleMarkdown` (bouton + `aria-expanded`, r?gion). Page `notre-programme` + `FestivalEditorialNode` ; cl?s i18n `expandMarkdownDetails` / `collapseMarkdownDetails` (fr/en/es). |
| [2026-05-02] Completed Task | Explore carrousel elliptique ? commit + push V2 | Commit `5f83f70` sur `main` (5 fichiers : `exploreOrbitLayout.ts`, `ExploreMobileCarousel.tsx`, messages fr/en/es). Cherry-pick `9962a0f` sur `amelioration-experience-mobile-V2` ; `git push origin amelioration-experience-mobile-V2` (c741403..9962a0f). WIP restant en stash (`wip fichiers restants`, etc.). |
| [2026-05-02] Completed Task | Explore mobile ? centrage orbite (suivi) | `ExploreMobileCarousel.tsx` : suppression `ref` inutilis? ; `vw`?px bas? sur `document.documentElement.clientWidth` (align? sur l?unit? CSS `vw`) + `useLayoutEffect` pour le 1er paint. |
| [2026-05-02] Completed Task | Explore mobile ? centrage plan?tes (correctif r?el) | Cause : wrap `w-[65vw]` + bouton `inline-flex` align? ? gauche ? `translate(-50%)` centrait la bo?te vide, pas la sph?re. Fix : `w-max max-w-[?]` + `transformOrigin`. `PlanetCardSphere` : highlights radial sym?triques en X (?vite biais visuel gauche). |
| [2026-05-05] Completed Task | Explore mobile ? orbite centr?e sur l?axe vertical ?cran | `ExploreMobileCarousel` : suppression `pb-[38vh]` sur le flex de centrage (le dock est overlay) pour placer le centre de l?orbite au milieu vertical. |
| [2026-05-05] Completed Task | Page /artistes ? perf (Cloudinary + SSR) | `cloudinaryImage.ts` (c_fill,w,f_auto,q_auto) ; `ArtistCard` sans `unoptimized` Cloudinary ; liste en Server Component + `getArtistsForArtistsPage` (revalidate 120s) + `ArtistesPageClient` ; refresh admin garde `getArtists` no-store. |
| [2026-05-05] Completed Task | PlanetOverlay ? Book Your Pass | Masquage `short_description` pour n?ud d?tect? nom/slug ? book your pass ? (accroche type ?cole nationale de danse retir?e de l?overlay). |
| [2026-05-05] Completed Task | OrganizationNode ? ordre Explore | Champ `explore_order`, migration `0008`, API tri?e ; serializers + PATCH admin ; admin list editable ; type TS ; `03-api_docs.md`. |

| [2026-08-23 15:50] Starting Task | Jack N Jill i18n FR/EN/ES | Objectif : traduire /festival/jack-n-jill avec fallback locale + seed Django. |
| [2026-08-23 16:05] Completed Task | Notre programme ? 3 affiches planning | Outcome: pbvf-2026-planning-thursday-friday/saturday/sunday.png, FestivalPlanningSchedule 3 images, i18n FR/EN/ES mis ? jour. |


| [2026-08-21 17:16] Starting Task | Acc?s & Venue ? contenu Officiel | Objectif : page /festival/acces-venue avec Markdown FR/EN/ES (maps Area 1/2), m?me pattern fallback que Notre programme / All Star. |
| [2026-08-21 17:17] Completed Task | Acc?s & Venue ? contenu Officiel | Outcome: fallback FR/EN/ES + images area1/area2, page avec repli locale, seed migration 0032, titres i18n mis ? jour. |
| [2026-08-21 17:36] Completed Task | Overlay Explore Access & Venue | Outcome: PlanetOverlay affiche le Markdown FR/EN/ES (fallback) + CTA /festival/acces-venue ; detection par nom/slug/cta. |
| [2026-08-21 17:41] Completed Task | Teaser Access & Venue overlay | Outcome: MP4 public/video/acces-venue-teaser.mp4 remplace le cover plan dans PlanetOverlay. |
| [2026-08-21 17:55] Completed Task | Fix build Vercel SSG timeout | Outcome: AbortSignal build + sitemap race + staticPageGenerationTimeout 180. |
| [2026-08-21 18:21] Completed Task | Fix SSG timeout g?n?ralis? | Outcome: apiFetch sur tous les appels api.ts (care/soins inclus). |
| [2026-08-23 15:38] Starting Task | Markdown sauts de ligne | Objectif : breaks:true + prose [&_p]:mb-4 pour pages ?ditoriales. |
| [2026-08-23 15:39] Completed Task | Markdown sauts de ligne | Outcome: markdownToHtml breaks:true + prose [&_p]:mb-4 ; dev local lanc?. |
| [2026-08-23 17:10] Completed Task | Plan entr?e site Acc?s & Venue | Outcome: SiteEntryPlanMedia photo/vid?o, markdownEmbed, assets public/, migration 0038, i18n FR/EN/ES. |
| [2026-08-23 17:15] Starting Task | Masquer contr?les vid?o fond | Objectif : retirer prev/pause/next visibles sur la landing derri?re les CTA. |
| [2026-08-23 17:18] Completed Task | Masquer contr?les vid?o fond | Outcome: pointer-events-none + ambient-video-layer sur GlobalVideoBackground, playerVars YT renforc?s, CSS webkit controls. |
| [2026-08-23 17:20] Completed Task | Modale Explore ? bouton Compris | Outcome: couleur/animation chargement (shimmer bleu-violet), or #f3ac41 quand sc?ne pr?te, i18n readyHint FR/EN/ES. |
| [2026-08-23 17:22] Completed Task | Titre onglet accueil | Outcome: generateMetadata landing.metaTitle (absolute), layout racine default festival, openGraph/twitter. |
| [2026-08-23 17:25] Completed Task | SiteEntryPlan autoplay | Outcome: play() au toggle vid?o + autoPlay/preload auto dans SiteEntryPlanMedia. |
| [2026-08-23 17:38] Starting Task | Token [SITE_ENTRY_PLAN] visible | Objectif : le token s'affiche brut dans l'overlay Explore Access & Venue (page OK). |
| [2026-08-31 19:20] Starting Task | Mobile artistes API prod | Objectif : charger les artistes sur téléphone Expo Go via Railway (Supabase via Django). |
| [2026-08-31 20:05] Completed Task | Planning cours mobile + DB | Outcome: modèle FestivalProgramSlot, 64 créneaux seed affiches, API /api/festival/program/, app mobile branchée. |
| [2026-09-13 22:50] Completed Task | PWA Expo export | Outcome: manifest + SW, build:pwa → dist/, generateStaticParams artistes, videoCache.web, CORS netlify. |
| [2026-08-23 20:16] Completed Task | Retrait concert live A?ejo Vibe | Outcome: ligne supprim?e FR/EN/ES (messages + sidecars notre_programme) ; migration 0039 refresh DB. |
| [2026-08-23 18:06] Completed Task | Indicateur pause au lancement | Outcome: iframe YT r?v?l?e seulement ? l'?tat PLAYING (fondu 0.4s) + filet de s?curit? 2500 ms si l'autoplay est refus?. Pi?ge trouv? : `YT.Player` REMPLACE le div `containerRef` par son iframe, donc React ne peut plus modifier son style ; l'opacit? doit ?tre port?e par un wrapper parent. Appliqu? aux 3 lecteurs ExploreVideos + YouTubeVideoBackground. |
| [2026-08-23 17:53] Completed Task | Indicateur pause vid?o de fond | Outcome: reprise auto sur ?tat PAUSED (2) dans ExploreVideos / YouTubeVideoBackground / CycleVideoOnly + CSS webkit overlay-play-button. L'iframe YT ?tant cross-origin, l'indicateur central n'est pas stylable : on ?vite l'?tat pause. |
| [2026-08-23 17:50] Completed Task | SiteEntryPlan autoplay (2e essai) | Outcome: useEffect play() au passage en mode vid?o + repli muet si NotAllowedError. V?rifi? page et overlay : paused=false, muted=false, lecture avanc?e. |
| [2026-08-23 17:47] Completed Task | Titre onglet Explore | Outcome: `(main)/explore/layout.tsx` title `{ absolute: "Festival PBVF Paris" }` (sans suffixe template). |
| [2026-08-23 17:44] Completed Task | Token [SITE_ENTRY_PLAN] visible | Outcome: rendu partag? `MarkdownWithEmbed.renderMarkdownWithEmbed` ; EditableConfigMarkdownPage refactor? dessus ; PlanetOverlay rend SiteEntryPlanMedia (i18n pages.festivalVenue) au lieu du HTML brut. V?rifi? page + overlay, toggle photo/vid?o OK. |
| [2026-08-29 18:25] Completed Task | Affiches navettes planning-navettes | Outcome: images jeudi?vendredi puis samedi?dimanche sur /festival/planning-navettes (`FestivalShuttleSchedule`), i18n FR/EN/ES, push main. |
| [2026-08-30 19:10] Starting Task | Affiches Jack N Jill | Objectif : int?grer les affiches pr?-s?lection (samedi) et finale (dimanche) sur `/organisation/noeuds/jack-n-jill-vibe` et `/festival/jack-n-jill`. |
| [2026-08-30 19:12] Completed Task | Affiches Jack N Jill | Outcome: PNG dans `frontend/public/images/festival/`, markdown FR/EN/ES + fallback TS, migration `0040_refresh_festival_jack_n_jill_markdown_posters`. |
| [2026-08-30 19:15] Completed Task | Affiches Jack N Jill mobile | Outcome: �cran `mobile/app/jack-n-jill.tsx`, assets locaux, lien depuis Infos pratiques. |
| [2026-08-30 19:22] Completed Task | Affiches overlay Explore J&J | Outcome: `withJackNJillPosters()` injecte les PNG dans PlanetOverlay même si l'API n'a pas encore les images. |
| [2026-08-31 17:45] Completed Task | Accord Venue officielle | Outcome: « Venue officielle & Zones » dans `fr.json`, fallback + sidecar FR, migration `0041`. |
| [2026-08-30 20:35] Completed Task | Polish mobile formes + typo | Outcome: radius 12/8px, surfaces plates, Urbane titre seul, Inter UI, tab bar sans glow, chips sans bordures, DESIGN.md mis a jour. |
| [2026-08-31 15:50] Completed Task | Horaires navettes app mobile | Outcome: extraction 132 departs (jeu-dim), shuttles.seed.json, SQLite expo-sqlite, modele Django FestivalShuttleDeparture + migration seed. |
| [2026-08-31 16:05] Completed Task | API festival mobile Supabase | Outcome: GET /api/festival/shuttles/ + /api/festival/artists/, migrate 132 navettes Supabase, app mobile branchee (hooks API), SQLite retire. |
| [2026-09-14 20:40] Completed Task | PWA bouton retour + classement artistes | Outcome: `BackButton` pastille or + chevron (détail artiste flottant, navettes, J&J) ; tri `artist_display_order` comme le web + filtres Tous/Team CoF/Invités + rang 01… ; rebuild PWA sur http://localhost:4173. |
| [2026-09-14 20:55] Starting Task | Carte venue réelle + sous-areas | Objectif : remplacer le placeholder Voyager par area1/area2/area1-2 + accordéons sous-espaces. |
| [2026-09-14 21:00] Completed Task | Carte venue réelle + sous-areas | Outcome: images officielles dans `mobile/assets/images/festival/` ; `VENUE_AREAS` + accordéons Zone 1/2 sur `map.tsx` ; rebuild PWA. |
| [2026-09-14 21:10] Completed Task | Overview carte + vidéo entrée | Outcome: overview utilisateur `venue-overview.jpg` en premier ; onglet final Plan d’entrée avec `acces-venue-site-entry.mp4` ; rebuild PWA. |
| [2026-09-14 21:30] Completed Task | Lightbox cartes plein écran | Outcome: `FullscreenImageModal` + clic sur overview / Zones 1&2 / plans zone pour agrandir. |
| [2026-09-14 21:40] Completed Task | Update planning affiches + seed | Outcome: PNG `pbvf-2026-planning-*` remplacés ; seed + migration `0007` ; `program.seed.json` mobile (65 slots). |
| [2026-09-14 22:30] Completed Task | Onglet Juges J&J app + web | Outcome: 3 affiches panels ; onglets Infos/Juges mobile + `FestivalJackNJillTabs` sur `/festival/jack-n-jill`. |
| [2026-09-14 22:45] Completed Task | Section Passes app mobile | Outcome: page `/passes` (10 formules + affiches), lien depuis Infos ; rebuild PWA. |
| [2026-09-14 21:25] Completed Task | area1-2 + teaser Accès Venue | Outcome: image `area1-2` remise sous l’overview ; onglet final teaser `acces-venue-teaser.mp4` (hero page web) ; rebuild PWA. |
| [2026-09-14 22:50] Completed Task | Infos — retrait cartes venue | Outcome: suppressé cartes Venue/Aquaboulevard/Accès (doublons Carte) + `INFOS` ; Infos = Passes / Navettes / J&J. |
| [2026-09-14 23:00] Starting Task | Code de conduite PWA | Objectif : page Infos → carrousel horizontal 19 affiches CoC + lightbox. |
| [2026-09-14 23:05] Completed Task | Code de conduite PWA | Outcome: `/code-of-conduct` pager swipe + dots + flèches ; 19 PNG ; lien Infos ; rebuild PWA. |
| [2026-09-14 23:10] Completed Task | Planning Favoris multi-jours | Outcome: ★ Favoris ignore le filtre jour, liste groupée sur les 4 jours ; clic jour désactive Favoris. |
| [2026-09-14 23:15] Completed Task | Accueil compteur live | Outcome: `LivePill` = temps restant H:MM:SS jusqu’à fin créneau (tick 1s) à la place de « En direct ». |
| [2026-09-14 23:20] Completed Task | Accueil pré-festival | Outcome: plus de faux « En ce moment » ; compteur « Avant le festival » jusqu’au 17 sept. ; live réel uniquement pendant un créneau. |
| [2026-09-14 23:25] Completed Task | Compteur ouverture 18h | Outcome: cible = jeudi 17 sept. 18h00. |
| [2026-09-14 23:30] Completed Task | Artistes chargement rapide | Outcome: seed immédiat + API en fond ; timeout web 6s ; PWA → `localhost:8000` (évite CORS Railway). |
| [2026-09-14 23:35] Completed Task | Passes format carrousel | Outcome: `/passes` aligné Code de conduite (swipe, dots, flèches, lightbox) ; intro + formules. |
| [2026-09-15 00:10] Completed Task | Annonces urgent + accueil | Outcome: modèle `FestivalAnnouncement` + API + admin ; bandeau urgent global ; fil normal sur accueil ; seed + dismiss AsyncStorage. Push OS = phase suivante. |
| [2026-09-15 00:15] Completed Task | Bandeau urgent ticker | Outcome: `UrgentBanner` en marquee défilant (reanimated) ; ✕ ferme toutes les urgentes. |
| [2026-09-15 00:45] Starting Task | PWA b+c URL + lien site | Objectif : URL canonique `app.capitaloffusion.com` + liens menu/landing/festival. |
| [2026-09-15 00:50] Completed Task | PWA b+c URL + lien site | Outcome: `getPwaUrl` + `NEXT_PUBLIC_PWA_URL` ; menu Festival injecté ; CTA landing + carte `/festival` ; CORS `app.capitaloffusion.com` ; doc `docs/bmad/11-pwa-deploy.md`. Deploy prod Vercel bloqué (CLI logout) → claim temporaire si besoin. |
| [2026-09-15 02:05] Completed Task | Retrait bouton App festival | Outcome: liens UI retirés (landing, menu, /festival) ; PWA reste sur app.capitaloffusion.com. |
| [2026-09-15 20:15] Starting Task | Page All Star Street Battle app | Objectif : écran Infos + lien sous J&J, contenu aligné fiche web. |
| [2026-09-15 20:20] Completed Task | Page All Star Street Battle app | Outcome: `/all-star-street-battle` (Infos/Règlement, affiche, CTAs Weezevent) ; carte Infos sous J&J ; asset JPG. |
| [2026-09-15 21:20] Starting Task | i18n app EN/FR/ES + gate PC | Objectif : défaut EN, drapeaux, AsyncStorage, message desktop. |
| [2026-09-15 21:30] Completed Task | i18n app EN/FR/ES + gate PC | Outcome: LocaleProvider + catalogs ; sélecteur drapeaux Infos ; DesktopGate ≥900px web ; UI traduite. |
| [2026-09-15 21:35] Starting Task | FAQ dans l’app PWA | Objectif : page Infos FAQ alignée contenu site, i18n EN/FR/ES. |
| [2026-09-15 21:40] Completed Task | FAQ dans l’app PWA | Outcome: `/faq` accordéon 8 Q/R (seed load_faq_data) ; carte Infos ; i18n. |
| [2026-09-15 23:05] Completed Task | Hero accueil + photo artiste | Outcome: logo centré et dates plus lisibles (`HomeHero`) ; hero fiche artiste 300px, dégradé limité au bas, cadrage centré. |
| [2026-09-15 21:20] Starting Task | Wire i18n mobile screens | Objectif : brancher `useLocale` / `t` / `tList` / `dayLabel` sur tous les écrans & composants UI listés. |
| [2026-09-15 21:25] Completed Task | Wire i18n mobile screens | Outcome: tous les écrans/composants listés utilisent `t`/`tList`/`dayLabel` ; LanguageFlags sur Infos ; filtres lineup ; clés map.* pour zones. |
| [2026-09-15 23:25] Completed Task | Ajout artiste Lina | Outcome: entrée `lina` (id 63) dans `artists.seed.json` ; photo placeholder — uploader sur Cloudinary via admin Django pour personnaliser. |
