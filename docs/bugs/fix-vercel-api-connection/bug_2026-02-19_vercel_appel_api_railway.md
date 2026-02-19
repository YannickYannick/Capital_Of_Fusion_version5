# Bug — Le front Vercel n’appelle pas l’API Railway (Failed to fetch)

**Date :** 2026-02-19  
**Branche :** fix/vercel-api-connection

---

## 🚨 Le problème

Sur le site déployé sur **Vercel** (ex. `https://capital-of-fusion-version5-xxx.vercel.app/evenements`), la page affiche **« Failed to fetch »** et **« Aucun événement pour le moment »**. La console montre des requêtes vers le **domaine Vercel** (ou timeout) au lieu du backend Railway.

**Cause :** La variable **`NEXT_PUBLIC_API_URL`** n’est pas définie (ou pas prise en compte) dans les **Environment Variables** du projet Vercel. Au build, le front n’a donc pas l’URL du back et utilise le fallback (même origine ou `localhost:8000`), ce qui ne pointe pas vers Railway.

---

## 🕵️ Investigation

- Les appels API passent par `getApiBaseUrl()` dans `frontend/src/lib/api.ts`, qui lit `process.env.NEXT_PUBLIC_API_URL`.
- En production sur Vercel, cette variable est injectée **au moment du build**. Si elle est absente, le code peut utiliser un fallback (ex. `window.location.hostname:8000` ou `localhost:8000`), ce qui ne correspond pas au back sur Railway.
- Les erreurs **ERR_TIMED_OUT** / **ERR_CONNECTION_TIMED_OUT** indiquent que le navigateur tente de joindre une URL inaccessible (mauvais host ou port).

---

## ✅ Solution

1. **Sur Vercel** : **Settings** du projet → **Environment Variables** (menu de gauche).
2. Ajouter (ou modifier) :
   - **Key :** `NEXT_PUBLIC_API_URL`
   - **Value :** `https://capitaloffusionversion5-production.up.railway.app` (sans slash final)
   - **Environments :** cocher au moins **Production** (et **Preview** si tu veux que les previews utilisent aussi Railway).
3. **Sauvegarder** puis lancer un **Redeploy** du projet (les variables `NEXT_PUBLIC_*` sont lues au build ; un nouveau déploiement est nécessaire).
4. **Côté Railway** : vérifier que **`CORS_ALLOWED_ORIGINS`** contient l’URL du front Vercel (ex. `https://capital-of-fusion-version5-xxx.vercel.app` ou ton domaine perso). Plusieurs origines possibles, séparées par des virgules.

Après redeploy Vercel, le front appellera bien `https://capitaloffusionversion5-production.up.railway.app/api/...`.

---

## 🧠 Post-mortem

- **Checklist déploiement :** avant de considérer le déploiement front terminé, vérifier que **NEXT_PUBLIC_API_URL** est définie sur Vercel et qu’un build a été fait **après** l’ajout de la variable.
- Rappel : toute modification de **Environment Variables** sur Vercel nécessite un **nouveau déploiement** pour être prise en compte (build time).
