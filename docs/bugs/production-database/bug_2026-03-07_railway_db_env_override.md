# Bug — Production Railway utilise une base différente du local (DATABASE_URL écrasée par .env)

**Date :** 2026-03-07  
**Contexte :** Déploiement backend Railway + Supabase, même `DATABASE_URL` configurée en prod et en local.

---

## Le problème

- **Symptôme :** En production (Explore sur Vercel), aucune planète / données ; en local, 15 noeuds visibles. La même `DATABASE_URL` (Supabase) est pourtant définie dans Railway et dans `backend/.env`.
- **Impression :** « Railway utilise SQLite » ou « ce n’est pas la même base ».

**Cause racine :** En production, Django charge d’abord `config.settings.base`, qui appelle `environ.Env.read_env(BASE_DIR / '.env')`. Si un fichier `.env` est présent dans l’image déployée (ou créé par le build), il peut **écraser** la variable `DATABASE_URL` injectée par Railway. L’objet `env` utilisé ensuite dans `production.py` pour `env.db("DATABASE_URL")` lit alors la valeur issue du fichier (ou une valeur absente → fallback SQLite), et non celle de l’environnement Railway.

---

## Investigation

- **Conteneur Railway :** `env | grep DATABASE_URL` montre bien la bonne URL Supabase (eu-west-3, même que le `.env` local). Donc Railway injecte correctement la variable.
- **Code :** Dans `config/settings/base.py`, `environ.Env.read_env(os.path.join(BASE_DIR, '.env'))` est exécuté avant que `production.py` ne soit chargé. L’instance `env` partagée peut avoir été modifiée par ce fichier.
- **Comportement de django-environ :** `read_env()` remplit l’objet `Env` (et éventuellement `os.environ`) à partir du fichier. Un `.env` présent dans le conteneur (ancien déploiement, fichier committé par erreur, ou généré par le build) peut donc surcharger la `DATABASE_URL` de Railway et faire utiliser une autre base ou le fallback SQLite.

---

## Solution

Dans **`backend/config/settings/production.py`**, pour la configuration de la base de données, ne plus utiliser l’instance `env` importée de `base` (qui a pu être modifiée par `read_env`). Utiliser une **nouvelle instance** `environ.Env()` qui n’a jamais chargé de `.env`, afin de lire **uniquement** `os.environ` (valeurs injectées par Railway) :

```python
# Base de données : DATABASE_URL (Railway/Supabase) prioritaire, ...
# On utilise os.environ directement (pas env) pour éviter qu'un .env présent dans l'image n'écrase la valeur Railway.
if os.environ.get("DATABASE_URL"):
    import environ
    _env = environ.Env()
    DATABASES = {"default": _env.db("DATABASE_URL")}  # _env vierge => lit uniquement os.environ
```

Fichier concerné : `backend/config/settings/production.py`.

---

## Vérifications utiles

- **Même base local / prod :** S’assurer que la valeur de `DATABASE_URL` dans les Variables Railway est **strictement identique** à celle de `backend/.env` (même host, région Supabase, user, mot de passe, port). Une différence (ex. eu-west-1 vs eu-west-3, ou typo dans l’identifiant projet) = deux bases différentes.
- **Données manquantes en prod :** Si la base est bien partagée mais vide côté prod, exécuter une fois `load_demo_data` dans le conteneur Railway (SSH ou `railway run`) pour créer les planètes et données démo. Voir [deploiement.md](../explication/deploiement.md) et [donnees_demo.md](../explication/donnees_demo.md).

---

## Post-mortem

- **Cause :** Utilisation en production du même objet `env` que celui modifié par `read_env(.env)` dans `base.py`, permettant à un éventuel `.env` dans l’image d’écraser la `DATABASE_URL` injectée par la plateforme.
- **Correctif :** En production, configurer `DATABASES` à partir d’une instance `Env()` vierge qui ne lit que `os.environ`, garantissant l’usage des variables Railway.
- **À retenir :** En prod, ne jamais faire dépendre la config sensible (DB, secrets) d’un fichier `.env` pouvant exister dans l’image ; privilégier les variables d’environnement de la plateforme.
