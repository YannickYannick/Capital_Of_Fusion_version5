# Bug — Build Vercel timeout sur `/sitemap.xml` et pages artistes

**Branche :** `Plan-Access-update`  
**Date :** 2026-08-21

## 🚨 The Issue

Build Vercel (`next build`) échoue après compilation réussie :

```
Failed to build /sitemap.xml/route … took more than 60 seconds
Failed to build /(main)/artistes/page … took more than 60 seconds
Export encountered an error on /sitemap.xml/route
```

Indépendant du contenu Accès & Venue : le pré-rendu SSG appelle l’API Django sans timeout ; si l’API est lente / down / `localhost` injoignable, le fetch reste pendu jusqu’au timeout Next (60s × 3).

## 🕵️‍♂️ Investigation

- Compile + lint OK.
- Échec à « Generating static pages ».
- `sitemap.ts` : `getCourses()` / `getEvents()` dans un `try/catch` — inutile si la Promise ne se résout jamais.
- `/artistes` : `getArtistsForArtistsPage()` même problème.
- Sans `NEXT_PUBLIC_API_URL` au build → fallback `http://localhost:8000` (pendu sur Vercel).

## ✅ The Solution

1. `apiFetchInit()` : `AbortSignal.timeout(12s)` pendant `NEXT_PHASE=phase-production-build` (menu, config, courses, events, artists).
2. `sitemap.ts` : `Promise.race` 10s + pages statiques de repli.
3. `next.config.ts` : `staticPageGenerationTimeout: 180`.

Vérifier aussi sur Vercel : **`NEXT_PUBLIC_API_URL`** = URL Railway (Production + Preview).

## 🧠 Post-Mortem

Toujours timeouter les fetch au build. Ne pas compter sur `try/catch` pour un réseau qui ne répond pas. Documenter `NEXT_PUBLIC_API_URL` comme prérequis de build Vercel.
