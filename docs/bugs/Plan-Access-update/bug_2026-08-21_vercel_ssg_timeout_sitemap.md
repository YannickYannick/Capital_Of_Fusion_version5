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

1. `apiFetch()` centralisé : **tous** les appels de `api.ts` passent par un `AbortSignal.timeout(10s)` pendant `next build`.
2. `sitemap.ts` : `Promise.race` 10s + pages statiques de repli.
3. `next.config.ts` : `staticPageGenerationTimeout: 120` (filet).

Vérifier aussi sur Vercel : **`NEXT_PUBLIC_API_URL`** = URL Railway (Production + Preview).

## 🧠 Post-Mortem

Toujours timeouter les fetch au build. Un correctif partiel (seulement sitemap/artistes) laisse échouer d’autres pages SSG (`/care/soins`, etc.). Documenter `NEXT_PUBLIC_API_URL` comme prérequis de build Vercel.
