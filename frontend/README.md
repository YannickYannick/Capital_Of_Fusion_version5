# Frontend — Site Bachata V5

Next.js 15 + Tailwind CSS. Layout unique `(main)`.

## Démarrage

```bash
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## API backend en local

Pour que le front appelle **ton Django** (et non l’URL Railway par défaut de `.env.example`) :

1. Copier `/.env.local.example` vers `/.env.local`.
2. Y mettre `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` (déjà le cas dans l’exemple).
3. Lancer le backend depuis `backend/` : `python manage.py runserver`.

`/.env.local` est ignoré par Git : la **production** continue d’utiliser les variables définies sur Vercel (ou autre), sans risque de casser le déploiement.

## Template de pages (StandardPage)

Les pages publiques (hors dashboard / login / register) utilisent un layout commun pour une UX homogène :

- **StandardPageShell** — conteneur : `min-h-screen pt-64 pb-20 px-4 md:px-8`, `max-w-6xl mx-auto`.
- **StandardPageHero** — hero centré : petit libellé violet (eyebrow), titre 5xl/6xl avec partie en gradient, description.
- **StandardCardsGrid** — grille responsive 1 → 2 → 3 colonnes, `gap-8`.

Fichier : `src/components/shared/StandardPage.tsx`. Exemple d’usage : `/cours`, `/care`, `/artistes`, `/organisation/poles`, `/organisation/staff`, `/partenaires/structures`, `/fichiers`.

## Vidéo de fond YouTube

- **Page d’accueil (`/`)** : vidéo d’introduction (config `main_video`).
- **Toutes les autres pages du menu** (sauf `/dashboard`, `/login`, `/register`) : vidéo explore en fond (`cycle_video`), contenu en translucide par-dessus.
- Config optionnelle en `.env.local` : `NEXT_PUBLIC_YOUTUBE_VIDEO_ID`, `NEXT_PUBLIC_YOUTUBE_CYCLE_VIDEO_ID`.
