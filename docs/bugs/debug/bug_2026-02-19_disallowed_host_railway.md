# Bug — DisallowedHost sur le nouveau service Railway

**Date :** 2026-02-19  
**Branche :** debug

---

## 🚨 Le problème

**Erreur :** `DisallowedHost at /`  
**Message :** `Invalid HTTP_HOST header: 'capitaloffusionversion5-production.up.railway.app'. You may need to add 'capitaloffusionversion5-production.up.railway.app' to ALLOWED_HOSTS.`

**Contexte :**
- Nouveau service déployé sur Railway (Builder Railpack).
- Requête : `GET http://capitaloffusionversion5-production.up.railway.app/`
- Django 6.0.2, Python 3.12.12.
- Exception : `django.http.request.get_host` (ligne 205).

**Détails techniques :**
- Request URL: `http://capitaloffusionversion5-production.up.railway.app/`
- Exception Location: `/app/.venv/lib/python3.12/site-packages/django/http/request.py`, line 205, in `get_host`
- Python: `/app/.venv/bin/python`
- Server time: Thu, 19 Feb 2026 22:32:04 +0100

---

## 🕵️ Investigation

- En **production** (`config.settings.production`), `ALLOWED_HOSTS` a déjà par défaut  
  `capitaloffusionversion5-production.up.railway.app` et `.up.railway.app`.
- Si cette erreur apparaît, c’est que le service n’utilise **pas** les settings production : soit `DJANGO_SETTINGS_MODULE` n’est pas défini, soit il pointe vers `config.settings.local`.
- Dans `config/wsgi.py`, le défaut est `config.settings.local`, qui n’autorise que `localhost` et `127.0.0.1` → d’où le `DisallowedHost` pour le host Railway.

---

## ✅ Solution

Sur le **nouveau service** Railway, définir les **variables d’environnement** :

| Variable | Valeur |
|----------|--------|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| (optionnel) `ALLOWED_HOSTS` | `capitaloffusionversion5-production.up.railway.app,.up.railway.app` |

Avec `config.settings.production`, le host Railway est déjà autorisé par défaut. Redéployer après avoir ajouté/sauvegardé les variables.

---

## 🧠 Post-mortem

- **Cause :** Nouveau service créé sans reprendre les variables du service précédent (notamment `DJANGO_SETTINGS_MODULE`).
- **À faire à l’avenir :** Pour tout nouveau service backend Railway, configurer d’emblée `DJANGO_SETTINGS_MODULE`, `DJANGO_SECRET_KEY`, `ALLOWED_HOSTS` (ou s’appuyer sur les valeurs par défaut de production). Documenter une checklist « Variables par service » dans `docs/explication/deploiement.md`.
