# Déploiement — Site Bachata V5

**Objectif :** déployer le frontend (Next.js) sur Vercel et le backend (Django + PostgreSQL) sur **Railway** (recommandé) ou **Render**, puis connecter les deux. Un seul hébergeur backend suffit.

---

## Prérequis

- Un **compte GitHub** avec le repo du projet poussé.
- **Vercel** (frontend) + **Railway** ou **Render** (backend, au choix).

---

## Ordre recommandé

1. Déployer le **backend** pour obtenir l’URL de l’API.
2. Déployer le **frontend** en pointant vers cette URL.

---

## Étape 1 — Backend (Railway recommandé, ou Render)

### 1.1 Créer le projet

- **Railway** : [railway.app](https://railway.app) → New Project → Deploy from GitHub → sélectionner le repo.
- **Render** : [render.com](https://render.com) → New → Web Service → connecter le repo.

### 1.2 Base de données PostgreSQL

- **Railway** : dans le projet → New → Database → PostgreSQL. Les variables `DATABASE_URL` (ou `PGHOST`, `PGUSER`, etc.) sont souvent exposées automatiquement.
- **Render** : Dashboard → New → PostgreSQL. Noter les infos de connexion (Host, User, Password, Database, Port).

### 1.3 Configurer le service backend

- **Root / répertoire de travail :** `backend` (pas la racine du repo).
- **Commande de démarrage :**
  - **Railway** : le repo contient `backend/Procfile` qui définit la commande de start (collectstatic, migrate, gunicorn). Si tu overrides dans le dashboard, utilise **Start Command** : `python manage.py collectstatic --noinput && python manage.py migrate --noinput && exec gunicorn config.wsgi --bind 0.0.0.0:$PORT` (et ne supprime pas `gunicorn` de `requirements.txt`).
  - **Render** : Build Command `pip install -r requirements.txt`, Start Command : `gunicorn config.wsgi --bind 0.0.0.0:$PORT`.
- **Variables d’environnement** à définir :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DJANGO_SETTINGS_MODULE` | Toujours en prod | `config.settings.production` |
| `DJANGO_SECRET_KEY` | Clé secrète (générer une forte) | `votre-secret-key-long-et-aleatoire` |
| `ALLOWED_HOSTS` | Domaine(s) du backend | `votre-backend.railway.app` ou `votre-backend.onrender.com` |
| `DB_NAME` | Nom de la base PostgreSQL | (fourni par Railway/Render) |
| `DB_USER` | Utilisateur PostgreSQL | (fourni) |
| `DB_PASSWORD` | Mot de passe PostgreSQL | (fourni) |
| `DB_HOST` | Hôte PostgreSQL | (fourni) |
| `DB_PORT` | Port (souvent 5432) | `5432` |
| `CORS_ALLOWED_ORIGINS` | Optionnel. URL(s) du front (domaine perso) | Les **\*.vercel.app** sont autorisés automatiquement (regex). À renseigner seulement pour un domaine perso (ex: `https://capitaloffusion.fr`). |

**Test sans PostgreSQL (SQLite) :** si tu ne définis **aucune** variable `DB_NAME` ni `DB_HOST`, Django en production utilisera SQLite (fichier dans le conteneur). Pratique pour vérifier que l’app répond ; les données sont **perdues à chaque redéploiement**. Pense à lancer `python manage.py migrate` et éventuellement `load_demo_data` (shell Railway ou release command).

Sur **Railway**, si une variable `DATABASE_URL` est fournie, il faut soit la parser, soit utiliser les variables séparées. Beaucoup de projets utilisent `dj-database-url` ; ici on utilise `DB_*` pour rester simple. Si Railway n’expose que `DATABASE_URL`, il faudra l’ajouter dans les settings (ou remplir manuellement `DB_HOST`, `DB_USER`, etc. à partir de l’URL).

### 1.4 Migrations et statiques (automatique à distance)

La **commande de démarrage** (Procfile) exécute à chaque déploiement :

1. **`python manage.py collectstatic --noinput`** — collecte les fichiers statiques (admin, etc.).
2. **`python manage.py migrate --noinput`** — applique les migrations.
3. **Gunicorn** — lance l’app.

Pour charger les **données démo** une fois : `railway run python manage.py load_demo_data` (ou via SSH dans le conteneur).

### 1.5 Noter l’URL du backend

Exemple : `https://ton-projet.railway.app` ou `https://ton-service.onrender.com`.  
Cette URL sera utilisée pour `NEXT_PUBLIC_API_URL` côté frontend.

---

## Étape 2 — Frontend (Vercel)

### 2.1 Importer le projet

- [vercel.com](https://vercel.com) → Add New → Project → importer le repo GitHub.

### 2.2 Répertoire racine (Root Directory)

- Le frontend Next.js est dans **`frontend`**.  
- Dans les paramètres du projet Vercel : **Root Directory** → `frontend` (ou `./frontend`).  
- Vercel détecte alors automatiquement Next.js et utilise `npm run build` / `next start`.

### 2.3 Variables d’environnement

Dans Vercel : Project → Settings → Environment Variables. Ajouter :

| Variable | Valeur (exemple) |
|----------|------------------|
| `NEXT_PUBLIC_API_URL` | **Obligatoire.** URL du backend (étape 1.5), ex: `https://capitaloffusionversion5-production.up.railway.app` (sans slash final). Sans elle, le front appelle la mauvaise origine et « Failed to fetch » apparaît. |
| `NEXT_PUBLIC_SITE_URL` | URL du site front (Vercel ou domaine perso), ex: `https://ton-app.vercel.app` |
| `NEXT_PUBLIC_YOUTUBE_VIDEO_ID` | ID de la vidéo YouTube (fond landing), ex: `Dqg0oKlXpTE` |

Pour l’ID YouTube : si l’URL est `https://www.youtube.com/watch?v=Dqg0oKlXpTE`, l’ID est `Dqg0oKlXpTE`.

### 2.4 Redéploiement

Après avoir sauvegardé les variables, **lancer un redeploy** (Deployments → … → Redeploy). Les variables `NEXT_PUBLIC_*` sont prises en compte **au build** : sans nouveau déploiement, l’ancienne valeur (ou l’absence de valeur) reste utilisée.

---

## Étape 3 — CORS (backend)

- **Vercel (\*.vercel.app) :** toutes les origines du type `https://xxx.vercel.app` (preview et prod) sont **automatiquement autorisées** par le backend (regex en prod). Aucune variable à définir pour les déploiements Vercel.
- **Domaine perso :** si tu utilises un domaine personnalisé (ex: `https://capitaloffusion.fr`), ajouter dans les variables du backend : `CORS_ALLOWED_ORIGINS` = `https://capitaloffusion.fr` (plusieurs origines en les séparant par des virgules). Puis redéployer le backend.

---

## Checklist rapide

- [ ] Repo sur GitHub à jour
- [ ] Backend : Root = `backend`, build/start = gunicorn, variables (DJANGO_*, DB_*, ALLOWED_HOSTS ; CORS_ALLOWED_ORIGINS optionnel, \*.vercel.app autorisé par défaut)
- [ ] Backend : `migrate` (+ optionnel `load_demo_data`)
- [ ] Frontend : Root = `frontend`, variables NEXT_PUBLIC_*
- [ ] CORS = automatique pour \*.vercel.app ; ajouter domaine perso dans CORS_ALLOWED_ORIGINS si besoin
- [ ] Test : ouvrir le site Vercel, vérifier que les pages (cours, événements, explore) chargent les données depuis l’API

---

## En cas de problème

- **502 / 503 backend :** vérifier que la commande de démarrage est bien gunicorn et que `PORT` est utilisé (Railway/Render injectent `PORT`). Si erreur « gunicorn: command not found », utiliser `python -m gunicorn` au lieu de `gunicorn`.
- **CORS bloqué :** les URLs \*.vercel.app sont autorisées par le code (regex en prod). Si l’erreur continue :
  1. **Railway doit déployer le code à jour.** Si le correctif CORS est sur une branche (ex. `fix/vercel-api-connection`), soit merger cette branche dans `main` et pousser (Railway déploie alors depuis `main`), soit dans Railway → Settings du service → **Branch** = ta branche, puis **Redeploy**.
  2. Si tu utilises un domaine perso (hors Vercel), ajouter son URL dans `CORS_ALLOWED_ORIGINS` (schéma + domaine, sans slash final).
- **Données vides :** vérifier que les migrations ont été faites et, si tu utilises les données démo, que `load_demo_data` a été exécuté.
- **Front ne charge pas l’API :** vérifier `NEXT_PUBLIC_API_URL` (sans slash final en général) et que le backend répond en GET sur `/api/menu/items/` par exemple.

### Dépannage Railway : « No module named gunicorn » / « gunicorn: command not found »

Cela signifie que les dépendances ne sont pas installées dans l’environnement utilisé au démarrage (build incomplet ou venv non utilisé).

1. **Fichiers à avoir dans `backend/` (et à committer/pousser) :**
   - **`requirements.txt`** — doit contenir la ligne `gunicorn` (et `psycopg[binary]` pour PostgreSQL).
   - **`Procfile`** — définit la commande de start (présent dans `backend/`).
   - **`runtime.txt`** — optionnel, fixe la version Python (ex. `python-3.12`).

2. **Dans le dashboard Railway :**
   - **Settings** du service → **Root Directory** = `backend`.
   - **Start Command** : soit laisser Railway utiliser le Procfile (recommandé), soit définir la même commande que dans le Procfile (collectstatic, migrate, gunicorn).

3. **Vérifier que Railway installe les dépendances :**
   - **Deployments** → dernier déploiement → **Build Logs** : une phase doit exécuter `pip install -r requirements.txt`.
   - Faire **Clear build cache** puis **Redeploy** pour un build propre.

4. **Si ça échoue encore :** dans Railway, **Build Command** = `pip install -r requirements.txt`, **Start Command** = `gunicorn config.wsgi --bind 0.0.0.0:$PORT`, puis redéployer. Vérifier que **Root Directory** = `backend`.

---

*Dernière mise à jour : 2025-02-10*
