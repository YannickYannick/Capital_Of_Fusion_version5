# Frontend — Site Bachata V5

Next.js 15 + Tailwind CSS. Layout unique `(main)`.

## Démarrage

```bash
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Page |
|-------|------|
| `/` | Landing |
| `/explore` | Explore 3D |
| `/cours` | Catalogue cours |
| `/evenements` | Calendrier |
| `/boutique` | Boutique (Phase 2) |
| `/organisation` | Organisation (Phase 2) |
| `/login` | Connexion |

## Vidéos YouTube

Les vidéos de fond (landing) sont des **embeds YouTube**. Configurer via variable d'environnement :

```bash
# .env.local
NEXT_PUBLIC_YOUTUBE_VIDEO_ID=abc123
```

Ou remplacer `VIDEO_ID` dans le code. Ex. : `dQw4w9WgXcQ` pour `https://youtube.com/watch?v=dQw4w9WgXcQ`.
