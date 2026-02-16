# Hébergement — Site Bachata V5

**Contexte cible :** ~300 utilisateurs au total, ~100 visiteurs quotidiens, ~3 minutes par visite. Charge faible.

**Stack :** Next.js (front) + Django + DRF (back) + base de données (SQLite en dev, PostgreSQL en prod).

---

## Choix recommandé

| Rôle | Hébergeur | Pourquoi |
|------|-----------|----------|
| **Frontend (Next.js)** | **Vercel** | Idéal pour Next.js, déploiement simple, offre gratuite largement suffisante pour ce trafic. |
| **Backend (Django + API)** | **Railway** (recommandé) ou **Render** | Un seul des deux suffit. Railway : crédits puis facturation à l’usage. Render : offre gratuite possible (cold start après inactivité). |

---

## Détail

### Frontend — Vercel

- Connexion au repo GitHub, build sur la branche `main` (ou sur le dossier `frontend/` en monorepo).
- Variables d’environnement à configurer en prod : `NEXT_PUBLIC_API_URL` (URL du backend), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_YOUTUBE_VIDEO_ID`.
- À ce volume, l’offre gratuite suffit.

### Backend — Railway ou Render

- **Railway** : crédits gratuits au début, puis facturation à l’usage. Très pratique pour déployer un projet Django + base PostgreSQL managée.
- **Render** : offre gratuite possible, mais le service peut s’endormir après inactivité (première requête lente). Pour éviter les cold starts avec ~100 visites/jour, un petit plan payant (environ 7 €/mois) est plus confortable.
- En prod : utiliser **PostgreSQL** (pas SQLite). Configurer `DJANGO_SETTINGS_MODULE=config.settings.production` et les variables d’environnement (DB, `ALLOWED_HOSTS`, `SECRET_KEY`, etc.).

---

## Résumé

Pour **~100 utilisateurs quotidiens** et **~3 min par visite** :

- **Vercel** pour le front Next.js.
- **Railway** ou **Render** pour le back Django + PostgreSQL.

**Mise en place concrète :** voir [deploiement.md](deploiement.md) (étapes pas à pas Vercel + Railway/Render, variables d’environnement, CORS, migrations).

---

*Dernière mise à jour : 2025-02-10*
