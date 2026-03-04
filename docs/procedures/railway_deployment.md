# Procédure de Déploiement Backend : Railway

Cette procédure décrit comment déployer l'application backend Django sur Railway, gérer les variables d'environnement, et surtout, gérer les données avec la base intégrée SQLite éphémère.

## 1. Création et Configuration du Service
1. Sur le dashboard Railway, clique sur **New Project** > **Deploy from GitHub repo**.
2. Sélectionne le dépôt de **Capital of Fusion V5**.
3. Railway crée un service. Va dans **Settings** > **General** du service et dans **Root Directory**, mets `/backend`.

## 2. Variables d'Environnement (Railway)
Dans l'onglet **Variables** de ton service Railway, ajoute :
- `DJANGO_SETTINGS_MODULE` = `config.settings.production`
- `SECRET_KEY` = (Génère une clé complexe et secrète)
- `ALLOWED_HOSTS` = `capitaloffusionversion5-production.up.railway.app` (Ton domaine généré par Railway)
- `CORS_ALLOWED_ORIGIN_REGEXES` = `^https://[\w-]+\.vercel\.app$` (Pour que Vercel puisse requêter Railway)
- `SEED_SECRET_KEY` = `UnMotDePasseSecret` (Expliqué dans la section Seeding)

## 3. Configuration du Build et du Déploiement

### A - La version de Python (`.python-version`)
L'outil de build de Railway (Railpack / mise) peut échouer (erreur "No precompiled Python found") s'il essaie de compiler une version "trop récente" de Python demandée dans `runtime.txt`.
**Solution :** 
Supprime tout fichier `runtime.txt` et crée un fichier `.python-version` à la racine de `/backend` contenant simplement la version mineure standard :
```
3.11
```

### B - Le fichier de démarrage (`Procfile`)
Le `Procfile` à la racine de `/backend` indique à Railway comment lancer l'app. Il doit collecter les fichiers statiques, faire les migrations de DB, et lancer le serveur :
```
web: python manage.py collectstatic --noinput && python manage.py migrate --noinput && exec gunicorn config.wsgi --bind 0.0.0.0:$PORT
```

## 4. Le Piège de SQLite en Production et le "Seeding HTTP"

**⚠️ Le grand danger de Railway + SQLite :**
Si tu n'ajoutes pas de base de données PostgreSQL séparée sur Railway, Django utilisera SQLite (un simple fichier `db.sqlite3` stocké dans le conteneur).
**À CHAQUE DÉPLOIEMENT OU REDÉMARRAGE DU SERVICE RAILWAY, LE CONTENEUR EST DÉTRUIT. LE FICHIER `db.sqlite3` EST DONC COMPLÈTEMENT EFFACÉ.**

De plus, la commande `railway run python manage.py loaddata` télécharge les configurations de prod mais s'exécute sur TA machine locale. Elle de modifie donc pas la base de données du cloud.

### La Solution : Le Seeding via API HTTP

Pour palier à cela, l'architecture du projet comprend une route API cachée capable de reconstruire les données (Planètes, Utilisateurs) la volée.

**Fonctionnement :**
1. Les données sont écrites en "dur" sous forme de code Python dans `/backend/apps/organization/management/commands/seed_nodes.py`.
2. L'application possède une route POST `/api/seed/`.
3. Une fois Railway redéployé (et la base vierge), il suffit d'exécuter l'appel suivant (via PowerShell, curl ou le navigateur) avec ta `SEED_SECRET_KEY` :

```powershell
Invoke-RestMethod -Uri "https://capitaloffusionversion5-production.up.railway.app/api/seed/?key=TA_SECRET_KEY"
```

Cette action fera deux choses instantanément sur le serveur cloud :
- Exécution de `seed_nodes` : Insertion des Nœuds d'Organisation (Planètes 3D).
- Exécution de `create_admin` : Création du compte super-administrateur avec identifiants par défaut (`admin` / `admin`).

Dès que ça renvoie un status "done", Vercel recommencera afficher les planètes !
