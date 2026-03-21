# Inventaire composants UI (frontend)

## Organisation

| Zone | Chemin typique | Rôle |
|------|----------------|------|
| Layout & navigation | `src/components/shared/Navbar.tsx`, `MobileNav.tsx` | Menu principal, langues |
| Features métier | `src/components/features/*` | Explore (canvas Three.js), etc. |
| Admin | `src/components/admin/*` | Boutons traduction, outils staff |
| Pages | `src/app/(main)/**/page.tsx` | Routage App Router |

## Patterns

- **Styling** : **Tailwind CSS** (classes utilitaires).
- **3D** : **@react-three/fiber**, **@react-three/drei**, **three** — scène Explore (`features/explore/`).
- **Markdown / HTML safe** : **marked**, **isomorphic-dompurify** où contenu utilisateur ou CMS.

## État & données

- **Contextes** : `src/contexts/` (auth, options planètes Explore, etc.).
- **API** : hooks et fetch centralisés dans `src/lib/api.ts`.

Pour le détail d’une feature : voir `docs/features/` (ex. `explore-presets.md`, `navbar-dashboard.md`).
