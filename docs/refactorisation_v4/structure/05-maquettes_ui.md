# 🎨 Maquette UI/UX - BachataVibe V4

## 🎯 Landing Page - Vue d'Ensemble

```
┌────────────────────────────────────────────────────────────────┐
│  HEADER (Sticky)                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [🎵 Logo] [Cours▾] [Formations▾] [Trainings▾] [Artistes▾]│ │
│  │ [Théorie▾] [Care▾] [Shop▾] [Projets▾] [Organisation▾]    │ │
│  │                              [🗄️ DB] [🔍] [@John Doe▾]   │ │
│  └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  HERO SECTION                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │        🎭 CAPITAL OF FUSION FRANCE 🎭                     │ │
│  │     L'écosystème des danses afro-latines                  │ │
│  │                                                            │ │
│  │          [Découvrir nos événements]                        │ │
│  │                                                            │ │
│  └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  VISUALISATION INTERACTIVE 🌌                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │                     🌞                                    │ │
│  │              Capital of Fusion                             │ │
│  │                                                            │ │
│  │      🪐                                        🪐         │ │
│  │   Bachata Vibe                           Kompa Vibe       │ │
│  │                                                            │ │
│  │                           🪐                              │ │
│  │                      Amapiano Vibe                        │ │
│  │                                                            │ │
│  │  [Mode: 3D View] [Mode: Tree View] [🔍 Rechercher]       │ │
│  └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  ARBRE TEXTUEL (Fallback / Accessibilité)                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🌍 Capital of Fusion France                               │ │
│  │  └─ 💃 Bachata Vibe                                       │ │
│  │      ├─ ⭐ Bachata Vibe Experience [Voir fiche]           │ │
│  │      ├─ ⭐ Bachata Vibe Paris Hebdo [Voir fiche]          │ │
│  │      ├─ ⭐ Dominican Vibe [Voir fiche]                    │ │
│  │      ├─ 🎉 Paris Bachata Festival                         │ │
│  │      │   ├─ Jack n' Jill Vibe                             │ │
│  │      │   ├─ Street Battle                                 │ │
│  │      │   ├─ Social World Cup                              │ │
│  │      │   └─ Experience Palmeraie                          │ │
│  │      └─ ⭐ Bachata Vibe Lyon [Voir fiche]                 │ │
│  │  └─ 🎶 Kompa Vibe                                         │ │
│  │      └─ ⭐ Kompa Vibe Paris [Voir fiche]                  │ │
│  │  └─ 🔥 Amapiano Vibe                                      │ │
│  │      └─ ⭐ Amapiano Vibe Paris [Voir fiche]               │ │
│  └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  SECTIONS HIGHLIGHTS                                           │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │ 🎓 Cours    │ 📖 Forma... │ 🎉 Évén...  │ 🛍️ Shop     │   │
│  │ 120 cours   │ 50 articles │ 30 events   │ Nouveautés  │   │
│  │ [Voir tout] │ [Voir tout] │ [Voir tout] │ [Découvrir] │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Design System

### Palette de Couleurs

```css
/* Primary (Bachata = Rouge/Rose) */
--primary-500: #E63946;
--primary-600: #D62828;
--primary-700: #B91C1C;

/* Secondary (Kompa = Bleu) */
--secondary-500: #457B9D;
--secondary-600: #1D3557;

/* Accent (Amapiano = Jaune/Or) */
--accent-500: #F77F00;
--accent-600: #D62828;

/* Neutrals */
--gray-50: #F9FAFB;
--gray-900: #111827;

/* Dark mode */
--bg-dark: #0F172A;
--surface-dark: #1E293B;
```

### Typography

```css
/* Headings */
font-family: 'Outfit', sans-serif;

/* Body */
font-family: 'Inter', sans-serif;

/* Sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-4xl: 2.25rem;
```

---

## 🧩 Composants Clés

### 1. Navigation Bar

```
┌──────────────────────────────────────────────────────────┐
│ [🎵 Logo] [Cours▾] [Formations▾] ... [🗄️ DB] [@Avatar▾] │
└──────────────────────────────────────────────────────────┘

Comportement:
- Sticky au scroll
- Dropdowns au hover (desktop)
- Menu hamburger (mobile)
- Glassmorphism effect (backdrop-blur)
```

**Dropdown Menu (Exemple: Cours)**
```
┌─────────────────────┐
│ 📋 Liste & Planning │
│ 📍 Par ville        │
│ 📊 Par niveau       │
│ ➕ Créer un cours   │
└─────────────────────┘
```

### 2. Menu Utilisateur

```
[@John Doe▾]
    ↓
┌─────────────────────┐
│ 👤 Mon Profil       │
│ 📚 Mes Cours        │
│ 📅 Mes Événements   │
│ 🎉 Mes Festivals    │
│ 🛒 Mes Commandes    │
│ ⚙️ Paramètres       │
│ ─────────────────   │
│ 🚪 Déconnexion      │
└─────────────────────┘
```

### 3. Visualisation Planétaire 3D

**Technologies** : Three.js + React Three Fiber

```tsx
// Structure conceptuelle
<Canvas camera={{ position: [0, 0, 10] }}>
  <ambientLight intensity={0.3} />
  <pointLight position={[10, 10, 10]} />
  
  {/* Soleil central */}
  <Sun name="Capital of Fusion" />
  
  {/* Planètes orbitales */}
  <Planet 
    name="Bachata Vibe" 
    orbitRadius={5}
    color="#E63946"
  />
  <Planet 
    name="Kompa Vibe" 
    orbitRadius={7}
    color="#457B9D"
  />
  
  <OrbitControls />
</Canvas>
```

**Interactions**
- Hover : Highlight + Tooltip avec nom
- Click : Zoom + Panel latéral avec fiche
- Scroll : Zoom in/out
- Drag : Rotation de la scène

### 4. Fiche Détaillée (Panel Latéral)

```
┌────────────────────────────────┐
│ ✕                              │
│ BACHATA VIBE EXPERIENCE        │
│ ───────────────────────────    │
│                                │
│ [📹 Vidéo de présentation]     │
│                                │
│ Description:                   │
│ Lorem ipsum dolor sit amet...  │
│                                │
│ 📋 Informations:               │
│ ├─ 📅 Créé: 2020               │
│ ├─ 📍 Lieu: Paris              │
│ ├─ 🔁 Fréquence: Mensuel      │
│ └─ 👥 Organisateur: John Doe   │
│                                │
│ [📸 Galerie photos (4)]        │
│                                │
│ Prochaines dates:              │
│ • 15 Jan 2024 - Paris          │
│ • 20 Fév 2024 - Paris          │
│                                │
│ [🎟️ S'inscrire] [ℹ️ En savoir plus] │
└────────────────────────────────┘
```

### 5. Arbre Textuel (Fallback)

```
┌────────────────────────────────────────┐
│ 🔽 Capital of Fusion France            │
│  ┌────────────────────────────────────┐│
│  │ 🔽 Bachata Vibe                    ││
│  │  ┌────────────────────────────────┐││
│  │  │ ⭐ Bachata Vibe Experience     │││
│  │  │    [Voir fiche] [S'inscrire]  │││
│  │  └────────────────────────────────┘││
│  │  • Dominican Vibe [Voir fiche]    ││
│  │  🔽 Paris Bachata Festival        ││
│  │     • Jack n' Jill Vibe           ││
│  │     • Street Battle               ││
│  └────────────────────────────────────┘│
│  • Kompa Vibe [Voir fiche]             │
│  • Amapiano Vibe [Voir fiche]          │
└────────────────────────────────────────┘

Style: Accordion avec collapse/expand
```

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Navigation horizontale complète
- Visualisation 3D full width
- Sidebar pour fiches détaillées

### Tablet (768px - 1024px)
- Navigation avec quelques items condensés
- Visualisation 3D responsive
- Fiche en modal plutôt que sidebar

### Mobile (< 768px)
- Menu hamburger
- Pas de visualisation 3D (trop lourd)
- Arbre textuel avec accordions
- Fiche en modal full screen

---

## 🎨 Sections du Site

### Page Accueil
1. Hero avec CTA
2. Visualisation planétaire (ou arbre)
3. Highlights (Cours, Events, Shop)
4. Stats (Membres, Cours, Événements)
5. Témoignages
6. Newsletter

### Page Cours (/courses)
1. Filtres latéraux
2. Grille de cours cards
3. Pagination

### Page Détail Cours (/courses/:id)
1. Hero image
2. Description
3. Info pratiques (date, lieu, prix)
4. Professeur
5. Participants
6. Carte
7. CTA inscription

### Page Organisation (/organization)
1. Hero institutionnel
2. Visualisation 3D (planètes)
3. Arbre textuel
4. Présentation des pôles
5. L'équipe
6. Rejoindre

### Page Shop (/shop)
1. Filtres (catégories)
2. Grille produits
3. Panier sticky
4. Checkout

---

## 🗄️ Modale DB Schema

```
┌─────────────────────────────────────────────┐
│ ✕       Schéma de Base de Données           │
│ ─────────────────────────────────────────── │
│                                             │
│   [User] ──< [Course]                       │
│      │                                      │
│      ├──< [Event]                           │
│      │                                      │
│      └──< [Order]                           │
│                                             │
│   [Course] >──< [Enrollment]                │
│                                             │
│   [Event] >──< [EventRegistration]          │
│                                             │
│  ... (Diagramme ERD interactif)             │
│                                             │
│ [🔍 Rechercher table] [💾 Exporter PNG]     │
└─────────────────────────────────────────────┘

Librairie suggérée: Mermaid.js ou D3.js
```

---

## ✨ Animations & Micro-interactions

### Navigation
```css
/* Hover items menu */
.nav-item:hover {
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

/* Dropdown apparition */
.dropdown {
  animation: fadeInDown 0.3s ease;
}
```

### Planètes
```tsx
// Rotation continue
useFrame(() => {
  planetRef.current.rotation.y += 0.001;
});

// Hover scale
onPointerOver: () => scale.set(1.2)
onPointerOut: () => scale.set(1.0)
```

### Cards
```css
.course-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
```

---

Cette maquette conceptuelle pose les bases visuelles de BachataVibe V4 ! 🎨

---

*Renuméroté 08 → 05 (structure). Source V4 docs/architecture/ — 2025-02-10*
