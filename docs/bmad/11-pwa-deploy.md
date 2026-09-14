# Déploiement PWA — app.capitaloffusion.com

## Objectif

| Élément | Valeur |
|--------|--------|
| App | `mobile/` (Expo → `npm run build:pwa`) |
| URL canonique | `https://app.capitaloffusion.com` |
| Lien site | Menu Festival + landing + `/festival` |

## Étapes Vercel (une fois)

1. `npx vercel login` (compte qui gère capitaloffusion.com)
2. Dans `mobile/` :
   ```bash
   npx vercel link
   npx vercel env add EXPO_PUBLIC_API_URL production
   # → https://capitaloffusionversion5-production.up.railway.app
   npx vercel --prod
   ```
3. Vercel → Project → Settings → Domains → ajouter `app.capitaloffusion.com`
4. DNS (chez le registrar du domaine) :
   - Type **CNAME**
   - Nom : `app`
   - Cible : `cname.vercel-dns.com` (ou la valeur indiquée par Vercel)

5. Sur le front Next.js (Vercel site principal) :
   - Variable `NEXT_PUBLIC_PWA_URL=https://app.capitaloffusion.com`
   - Redeploy

## CORS Railway

`production.py` autorise déjà `*.vercel.app`. Pour le domaine custom, ajouter si besoin :
`https://app.capitaloffusion.com` dans `CORS_ALLOWED_ORIGINS`.
