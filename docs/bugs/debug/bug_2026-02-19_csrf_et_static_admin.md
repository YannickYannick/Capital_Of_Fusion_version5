# Bug — CSRF 403 et admin sans CSS (carrés noirs) sur Railway

**Date :** 2026-02-19  
**Branche :** debug

---

## 🚨 Le problème

1. **CSRF 403** sur la page de connexion admin (`/admin/login/`) :  
   *« Origin checking failed - https://capitaloffusionversion5-production.up.railway.app does not match any trusted origins. »*

2. **Carrés noirs** sur la même page : les assets statiques de l’admin (CSS, images) ne se chargent pas en production (DEBUG=False, Django ne sert pas les statiques par défaut).

---

## 🕵️ Investigation

- Django 4+ exige **CSRF_TRUSTED_ORIGINS** avec le schéma (ex. `https://domaine`) pour les formulaires POST.
- Sans **WhiteNoise** (ou équivalent), les fichiers statiques ne sont pas servis en prod → l’admin s’affiche sans style.

---

## ✅ Solution

1. **CSRF** — Dans `config/settings/production.py` :  
   - **CSRF_TRUSTED_ORIGINS** avec les origines Railway (https + http) par défaut.  
   - Variable d’env optionnelle : `CSRF_TRUSTED_ORIGINS` (liste d’URLs séparées par des virgules, sans slash final).

2. **Statiques admin** —  
   - **whitenoise** ajouté dans `requirements.txt` et en middleware (juste après `SecurityMiddleware`).  
   - **STATIC_ROOT** défini en production (`staticfiles/`).  
   - **Procfile** et **nixpacks** : `python manage.py collectstatic --noinput` exécuté au démarrage avant `migrate` et Gunicorn.

Fichiers modifiés : `config/settings/production.py`, `config/settings/base.py`, `requirements.txt`, `Procfile`, `nixpacks.toml`.

---

## 🧠 Post-mortem

- Nouveau service = vérifier **CSRF_TRUSTED_ORIGINS** et **statiques** (WhiteNoise + collectstatic) dès le déploiement prod.
