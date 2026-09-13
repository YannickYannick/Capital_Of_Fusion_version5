# Application mobile PBVF — React Native (Expo)

Stack : **Expo SDK 57** + **Expo Router** + **React Native** + **TypeScript** (Expo Go **57** requis sur téléphone).

Template UI d'origine : [music-fest-hub](https://github.com/YannickYannick/music-fest-hub) (réécrit en composants natifs).

## Lancer l'app

```bash
cd mobile
npm install
npm start
```

- **Expo Go** : scanner le **QR code** affiché dans le terminal (iPhone / Android, même Wi‑Fi).
- **Émulateur Android** : touche `a` dans le terminal Expo.
- **Simulateur iOS** (Mac) : touche `i`.

## Structure

```
mobile/
├── app/(tabs)/          # Écrans : accueil, timetable, carte, line-up, infos
├── src/
│   ├── lib/festival-data.ts
│   ├── hooks/useFavorites.ts
│   └── components/
├── assets/images/festival/
└── app.json
```

## Identifiants

- iOS : `com.capitaloffusion.pbvf`
- Android : `com.capitaloffusion.pbvf`

## PWA (web installable)

Même code que l’app Expo Go / APK, exporté en site statique.

```bash
cd mobile
npm run build:pwa          # → dossier dist/
npm run serve:pwa          # test local http://localhost:4173
```

- Manifeste : `public/manifest.json`
- Service worker : `public/sw.js`
- Déploiement : pointer l’hébergeur sur `mobile/dist` (ex. Vercel root `mobile`, output `dist`)
- Android Chrome : « Installer l’application »
- iOS Safari : Partager → « Sur l’écran d’accueil »
- API : `EXPO_PUBLIC_API_URL` (Railway). CORS autorise déjà `*.vercel.app` / `*.netlify.app`

## Ancienne stack (archivée)

Le code web TanStack Start + Capacitor est dans `mobile-web-legacy/` (si présent) — ne plus utiliser pour le mobile.

## Prochaines étapes

- Brancher `EXPO_PUBLIC_API_URL` → API Django
- Build store : `eas build` (Expo Application Services)
