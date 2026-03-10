## UX de référence – page1 & page2

Ce fichier garde une trace de l’UX actuelle de deux pages clés, pour pouvoir les réutiliser / recopier plus tard.

---

## page1 — `http://localhost:3000/care` (`care/page.tsx`)

### Rôle
Hub « bien-être » (Capital Care) qui renvoie vers les sous-pages : soins, praticiens, réservation.

### Layout global
- **Fond** : `bg-black`, texte blanc.
- **Espacement** : `min-h-screen`, `pt-40 pb-24`, marges horizontales responsives `px-6 sm:px-8 md:px-12 lg:px-16`.
- **Conteneur principal** : `max-w-7xl mx-auto` (centré large).

### Hero
- Centré (`text-center`), animé avec framer-motion (fade-in + slide-up).
- **Badge** : texte « Espace Bien-être » en capitales, très condensé (`uppercase`, `tracking-[0.3em]`, `text-[10px]`, `text-purple-500`, `font-black`).
- **Titre principal** :
  - `CAPITAL CARE` en énorme (`text-7xl md:text-9xl`), `font-black`, `tracking-tighter`, `italic`.
  - Mot `CARE` en violet (`text-purple-500`).
- **Sous-texte** : phrase d’accroche (`text-xl`, `text-white/40`, `font-light`, `max-w-2xl mx-auto`, `mt-6`).

### Cartes de navigation (3 colonnes)
- Grille : `grid grid-cols-1 md:grid-cols-3 gap-10`.
- Chaque carte est un `Link` vers :
  - `/care/soins` – Soins & Récupération.
  - `/care/praticiens` – Nos Praticiens.
  - `/care/reservation` – Réservation.
- **Card container** :
  - `relative h-[500px] overflow-hidden rounded-[3rem] border border-white/5 bg-white/[0.01]`.
  - Animée (scale + fade-in) au scroll via framer-motion (`whileInView`, `viewport={{ once: true }}`).
- **Image** :
  - `next/image` en `fill`, `object-cover`.
  - Effet : `grayscale-[50%]` par défaut, `group-hover:grayscale-0 group-hover:scale-105` pour un zoom/dé-saturation au hover.
- **Overlay** :
  - `absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent` (dégradé sombre du bas vers le haut).
- **Texte** (en bas à gauche) :
  - Titre : `text-3xl font-black italic tracking-tighter mb-4 uppercase` (nom de la section).
  - Description : `text-white/40 text-sm leading-relaxed max-w-[200px] opacity-0 group-hover:opacity-100 transition-all duration-500` (apparition progressive au survol).

---

## page2 — `http://localhost:3000/artistes` (`artistes/page.tsx`)

### Rôle
Listing des artistes Capital of Fusion (staff + partenaires), avec filtre par type.

### Layout global
- **Fond** : `bg-black`, texte blanc.
- **Espacement** : `min-h-screen`, `pt-40 pb-24`, `px-6 sm:px-8 md:px-12 lg:px-16`.
- **Conteneur principal** : `max-w-7xl mx-auto`.
- En cas de **loading initial** sans données : écran plein avec spinner circulaire violet centré.

### Header
- Composant `motion.header` (fade-in + léger slide-up).
- **Titre** :
  - `NOS ARTISTES` (`text-5xl sm:text-6xl`, `font-black`, `tracking-tighter`, `italic`).
  - `ARTISTES` en violet (`text-purple-500`).
- **Sous-texte** :
  - `text-lg sm:text-xl text-white/60 max-w-2xl font-light leading-relaxed`.
  - Texte expliquant qu’il s’agit des talents de Capital of Fusion, officiels + partenaires.

### Filtre (barre de segmentation)
- Section animée `motion.section` avec légère translation.
- Label « Filtrer » (`text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3`).
- Conteneur de boutons :
  - `flex flex-wrap gap-2 p-2 bg-white/[0.03] border border-white/10 rounded-2xl`.
- Boutons (3) :
  - **Tous** (`id='all'`).
  - **Team CoF** (`id='staff'` – filtre `staffOnly = true`).
  - **Externe** (`id='others'` – filtre `staffOnly = false`).
- Styles de boutons :
  - Commune : `px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all`.
  - Sélectionné : `bg-purple-600 text-white shadow-lg shadow-purple-600/20`.
  - Non sélectionné : `text-white/40 hover:text-white hover:bg-white/5`.

### Liste des artistes
- Données récupérées via `getArtists(staffOnly)` (`lib/api.ts`) avec `staffOnly` optionnel selon le filtre.
- En cas **d’erreur** :
  - Bloc plein largeur : `bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-red-500 text-center`.
  - Titre `Erreur de connexion` (`text-2xl font-black uppercase italic tracking-tighter`).  
  - Sous-texte léger (`text-sm font-light opacity-60`).
- En cas de **données OK** :
  - Grille responsive : `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8`.
  - Chaque artiste est rendu avec :
    - `motion.div` (fade-in + slide-up, léger delay basé sur `idx`).
    - Composant `ArtistCard` (`components/features/artists/ArtistCard.tsx`) pour l’UI détaillée (photo, nom, etc.).

### État « aucun artiste »
- Affichage seulement quand **non loading**, `artists.length === 0` et pas d’erreur.
- Bloc central :
  - `text-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]`.
  - Texte principal : `VIDE` (`text-3xl font-black tracking-widest uppercase italic`).
  - Sous-texte : `AUCUN ARTISTE NE CORRESPOND À CETTE CATÉGORIE` (`text-xs mt-4 tracking-[0.3em] font-light`).

