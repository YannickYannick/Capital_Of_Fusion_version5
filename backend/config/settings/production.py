"""
Configuration production — DEBUG False, DB, ALLOWED_HOSTS et CORS via env.
Usage: DJANGO_SETTINGS_MODULE=config.settings.production
"""
from .base import *  # noqa: F401, F403
import os

DEBUG = False

# Permet tout sous-domaine Railway (.up.railway.app) si ALLOWED_HOSTS non défini.
_default_hosts = "capitaloffusionversion5-production.up.railway.app,.up.railway.app"
ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", _default_hosts).split(",")
    if h.strip()
]

# CORS : origines autorisées (URL du front Vercel). Ex: https://mon-site.vercel.app,https://capitaloffusion.fr
_cors = os.environ.get("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors.split(",") if o.strip()]
CORS_ALLOW_CREDENTIALS = True

# CSRF : origines de confiance pour les formulaires POST (admin, login, etc.). Format: https://domaine (sans slash final).
_csrf_origins = os.environ.get(
    "CSRF_TRUSTED_ORIGINS",
    "https://capitaloffusionversion5-production.up.railway.app,http://capitaloffusionversion5-production.up.railway.app",
)
CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf_origins.split(",") if o.strip()]

# Fichiers statiques (admin, etc.) : WhiteNoise les sert en prod après collectstatic.
STATIC_ROOT = BASE_DIR / "staticfiles"

# Base de données : PostgreSQL si DB_NAME (ou DB_HOST) est défini, sinon SQLite pour test (données éphémères sur PaaS).
if os.environ.get("DB_NAME") or os.environ.get("DB_HOST"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", ""),
            "USER": os.environ.get("DB_USER", ""),
            "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            "HOST": os.environ.get("DB_HOST", ""),
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }
else:
    # SQLite : pratique pour tester sur Railway sans configurer PostgreSQL. Les données sont perdues à chaque redéploiement.
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
