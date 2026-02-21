# Maquettes UI – Données du site à jour (V4 actuel)

Wireframes et zones d'interface alignés sur la structure réelle du site (routes, navbar, pages). Référence pour la V5.

---

## 1. Routes et pages actuelles

| Route | Fichier | Description |
|-------|---------|-------------|
| `/` | `(main)/page.tsx` | Landing (accueil) |
| `/explore/` | `(main)/explore/page.tsx` | Expérience 3D – système planétaire |
| `/cours/` | `(main)/cours/page.tsx` | Liste des cours |
| `/evenements/` | `(main)/evenements/page.tsx` | Événements |
| `/boutique/` | `(main)/boutique/page.tsx` | Boutique |
| `/organisation/` | `(main)/organisation/page.tsx` | Organisation |
| `/login/` | `(main)/login` (lien navbar) | Connexion |

Toutes ces pages partagent le layout `(main)` : vidéo de fond persistante (Aftermoovie + fondue), navbar transparente puis opaque au scroll.

---

## 2. Landing Page (Accueil)

```
┌────────────────────────────────────────────────────────────────┐
│  NAVBAR (transparente → bg-black/80 au scroll)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [CF] Capital of Fusion   Accueil [Boutique▾] [Événements▾]│  │
│  │ [Explore▾] [Cours▾] [Formations▾] [Trainings▾] [Artistes▾]│  │
│  │ [Théorie▾] [Care▾] [Shop▾] [Projets▾] [Organisation▾] [👤]│  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  VIDÉO DE FOND (full viewport, z-index 0)                      │
│  Aftermoovie_vibe.mp4 + fondue avec background-video sur       │
│  /explore selon réglages                                        │
├────────────────────────────────────────────────────────────────┤
│  GRADIENT overlay (from-[#0a0e27] → transparent)               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Nouvelle Version Immersive]                             │  │
│  │                                                            │  │
│  │  Capital of Fusion                                         │  │
│  │  (gradient from-white via purple-100 to purple-200)        │  │
│  │                                                            │  │
│  │  Découvrez l'univers de la Bachata comme jamais...        │  │
│  │  Une expérience interactive en 3D au cœur de la danse.    │  │
│  │                                                            │  │
│  │  [▶ Commencer l'Expérience]  [Voir les Cours →]           │  │
│  │                                                            │  │
│  │  Paris, France • École Nationale de Danse                 │  │
│  └──────────────────────────────────────────┘                 │  │
└────────────────────────────────────────────────────────────────┘
```

- **CTA principal** : « Commencer l'Expérience » → `/explore/`.
- **CTA secondaire** : « Voir les Cours » → `/cours/`.
- **Navbar** : Logo (lien `/`), Accueil, puis Boutique, Événements, Explore, puis Cours, Formations, Trainings, Artistes, Théorie, Care, Shop, Projets, Organisation (avec sous-menus), icône utilisateur → `/login`. Voir section 5 pour le détail des dropdowns.

---

## 3. Page Explore (système planétaire 3D)

```
┌────────────────────────────────────────────────────────────────┐
│  NAVBAR (idem)                                                  │
├────────────────────────────────────────────────────────────────┤
│  SCÈNE 3D (full viewport, fond transparent pour voir la vidéo)  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Soleil central = noeud racine (ex. Capital of Fusion)    │  │
│  │  Planètes en orbite = noeuds d'organisation (OrganizationNode),  │  │
│  │  ex. BachataVibe Paris, BachataVibe Lyon (pas Cours/Événements/Boutique)  │  │
│  │  Données : API /organization/nodes/                        │  │
│  │  Contrôles : OrbitControls (rotation, zoom)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  OPTIONS (panneau flottant) : Orbits, Debug, Figer planètes,    │
│  Vidéo en fondue, Couleur planètes, Réglages globaux            │
│                                                                  │
│  AU CLIC PLANÈTE : zoom + possibilité d'ouvrir l'overlay       │
├────────────────────────────────────────────────────────────────┤
│  OVERLAY DÉTAIL (PlanetOverlay) – slide depuis la droite        │
│  ┌────────────────────────────────┐                             │
│  │ ✕  [Nom du noeud]              │                             │
│  │  Image / Vidéo, description    │                             │
│  │  short_description, content    │                             │
│  │  CTA [cta_text] → cta_url      │                             │
│  │  Événements (NodeEvent)        │                             │
│  └────────────────────────────────┘                             │
└────────────────────────────────────────────────────────────────┘
```

- Données 3D : **OrganizationNode** (noeuds d'organisation : pôles, partenaires, etc.) — name, slug, orbites, type planète, couleurs, etc. Les planètes ne sont pas les sections menu (Cours, Événements, Boutique) mais les noeuds d'organisation.
- Premier clic : zoom sur la planète ; second clic / bouton « Détails » : ouverture de l'overlay avec détail du noeud (cover_image, short_description, content, cta, node_events).
- Fallback : prévoir un affichage liste/arbre pour mobile et accessibilité (réf. [05-maquettes_ui.md](05-maquettes_ui.md)).

---

## 4. Pages Cours, Événements, Boutique, Organisation

Structure commune : même navbar + fond vidéo (layout `(main)`), contenu central.

- **Cours** (`/cours/`) : grille de cartes cours (API `/api/courses/`), liens vers `/cours/[slug]/` si détail.
- **Événements** (`/evenements/`) : liste / cartes événements (API `/api/events/`).
- **Boutique** (`/boutique/`) : produits (API `/api/shop/products/`).
- **Organisation** (`/organisation/`) : contenu organisation ; peut réutiliser la même scène 3D ou une vue liste.

Pas de wireframe ASCII détaillé ici ; les zones sont les mêmes que la landing (navbar + zone contenu). Pour la V5, prévoir des maquettes par page (filtres, grille, détail).

---

## 5. Navbar – Ordre, sous-menus et comportement

### 5.1 Ordre des entrées (de gauche à droite)

1. **Accueil** (lien `/`, pas de dropdown)
2. **Boutique** ▾
3. **Événements** ▾
4. **Explore** ▾
5. **Cours** ▾
6. **Formations** ▾
7. **Trainings** ▾
8. **Artistes** ▾
9. **Théorie** ▾
10. **Care** ▾
11. **Shop** ▾
12. **Projets** ▾
13. **Organisation** ▾  
14. (à droite) **Icône Utilisateur** → `/login/`

### 5.2 Sous-menus (contenu des dropdowns)

| Parent | Sous-menu | URL |
|--------|-----------|-----|
| **Boutique** | Pulls & Sweats | `/boutique/pulls/` |
| | T-shirts | `/boutique/tshirts/` |
| | Chaussures | `/boutique/chaussures/` |
| | Vins & Spiritueux | `/boutique/vins/` |
| **Événements** | Liste & Événements | `/evenements/` |
| | Festivals | `/evenements/festivals/` (à créer si besoin) |
| **Explore** | Expérience 3D | `/explore/` |
| | Arbre / Liste | `/explore/liste/` (fallback, à créer si besoin) |
| **Cours** | Liste & Planning | `/cours/planning/` |
| | Filtres (Ville, Niveau) | `/cours/filtres/` |
| | Détails des programmes | `/cours/programmes/` |
| | Inscription | `/cours/inscription/` |
| **Formations** | Contenu éducatif en ligne | `/formations/contenu/` |
| | Catégories | `/formations/categories/` |
| | Vidéothèque | `/formations/videotheque/` |
| **Trainings** | Sessions libres | `/trainings/sessions/` |
| | Organisation adhérents | `/trainings/adherents/` |
| **Artistes** | Annuaire | `/artistes/annuaire/` |
| | Profils & Bios | `/artistes/profils/` |
| | Booking | `/artistes/booking/` |
| | Avis & Notes | `/artistes/avis/` |
| **Théorie** | Cours théoriques | `/theorie/cours/` |
| | Quiz de connaissances | `/theorie/quiz/` |
| | Suivi de progression | `/theorie/progression/` |
| **Care** | Soins & Récupération | `/care/soins/` |
| | Nos Praticiens | `/care/praticiens/` |
| | Réservation | `/care/reservation/` |
| **Shop** | Pulls & Sweats | `/boutique/pulls/` (ou `/shop/pulls/`) |
| | T-shirts | `/boutique/tshirts/` |
| | Chaussures | `/boutique/chaussures/` |
| | Vins & Spiritueux | `/boutique/vins/` |
| **Projets** | Programme d'incubation | `/projets/incubation/` |
| | Autres initiatives | `/projets/initiatives/` |
| **Organisation** | Structure | `/organisation/structure/` |
| | Pôles | `/organisation/poles/` |

*Note : Boutique et Shop peuvent être unifiés (un seul label « Boutique » avec les mêmes sous-pages) ou gardés distincts selon le choix métier. Les URLs `/boutique/` sont celles des pages actuellement en place.*

### 5.3 Comportement

- **Logo** : `[CF] Capital of Fusion` → lien `/`.
- **Accueil** : lien `/`, pas de chevron.
- **Entrées avec ▾** : dropdown au hover (desktop) ou au clic (mobile) ; contenu selon le tableau ci-dessus.
- **Données** : chargées depuis l'API `GET /api/menu/items/` (parents + enfants). Pour respecter l'ordre et les sous-menus, adapter le script `populate_menu.py` (ordre des entrées : Boutique, Événements, Explore, puis Cours, Formations, Trainings, Artistes, Théorie, Care, Shop, Projets, Organisation).
- **Actions** : icône Utilisateur → `/login/`.
- **Scroll** : `bg-transparent` en haut, puis `bg-black/80 backdrop-blur-md border-white/10` après ~20px.
- **Mobile** : menu hamburger, menu plein écran avec les mêmes entrées et sous-menus (accordéon ou liste).

---

## 6. Design system (actuel)

| Élément | Valeur |
|--------|--------|
| **Fond global** | `#0a0e27` (--background) |
| **Texte** | blanc / white |
| **Accent** | purple (purple-400, purple-500, purple-100 à 200 pour gradients) |
| **Logo** | dégradé `from-purple-500 to-pink-500` |
| **Police** | Inter (body), via Tailwind |
| **Navbar** | transparente → `bg-black/80 backdrop-blur-md` |

Les couleurs détaillées (primary, secondary, accent) de [05-maquettes_ui.md](05-maquettes_ui.md) peuvent être réutilisées pour étendre la charte (boutons, états, erreurs).

---

## 7. Responsive

- **Desktop** : navbar horizontale, dropdowns au hover, scène 3D pleine largeur.
- **Tablette** : idem avec espacements adaptés ; overlay en panneau ou modal.
- **Mobile** : menu hamburger, panneau plein écran pour le menu ; sur Explore, privilégier liste/arbre + détail en modal plutôt que 3D lourde.

---

## 8. Synthèse

- **Routes à jour** : `/`, `/explore/`, `/cours/`, `/evenements/`, `/boutique/`, `/organisation/`, `/login`.
- **Layout** : groupe `(main)` unique, vidéo persistante, navbar transparente puis opaque.
- **Explore** : scène 3D (OrganizationNode), overlay détail (PlanetOverlay), options (orbites, debug, vidéo fondue).
- **Menu** : fourni par l'API ; les pages réelles correspondent aux routes ci-dessus (les sous-pages du menu peuvent pointer vers des URLs à créer en V5).

Ce document sert de base aux maquettes V5 ; pour les wireframes basse définition et le design system étendu, voir aussi [03-maquettes_wireframes.md](03-maquettes_wireframes.md) et [05-maquettes_ui.md](05-maquettes_ui.md).

---

*Copié depuis refactorisation_V5_Structuré (V4) — 2025-02-10 — routes (site) → (main), ref. 08 relative.*
