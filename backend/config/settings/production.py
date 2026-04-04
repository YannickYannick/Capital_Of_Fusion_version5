"""
Configuration production — DEBUG False, DB, ALLOWED_HOSTS et CORS via env.
Usage: DJANGO_SETTINGS_MODULE=config.settings.production
"""
from .base import *  # noqa: F401, F403
import os

DEBUG = False

# Railway : le client parle en HTTPS, Gunicorn reçoit souvent du HTTP. Sans cela,
# request.build_absolute_uri() et les URLs médias sortent en http:// → mixed content sur Vercel.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# Cloudinary : uniquement en prod. Ordre imposé par django-cloudinary-storage :
# cloudinary_storage + cloudinary AVANT django.contrib.staticfiles.
_apps = list(INSTALLED_APPS)
_static_i = _apps.index("django.contrib.staticfiles")
INSTALLED_APPS = (
    _apps[:_static_i]
    + ["cloudinary_storage", "cloudinary"]
    + _apps[_static_i:]
)

# Railway : définir les 3 variables (recommandé) :
# CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# Sinon CLOUDINARY_URL seule (CLOUDINARY_STORAGE vide → le SDK lit l'URL).
_cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME", "").strip()
_api_key = os.environ.get("CLOUDINARY_API_KEY", "").strip()
_api_secret = os.environ.get("CLOUDINARY_API_SECRET", "").strip()
if _cloud_name and _api_key and _api_secret:
    CLOUDINARY_STORAGE = {
        "CLOUD_NAME": _cloud_name,
        "API_KEY": _api_key,
        "API_SECRET": _api_secret,
    }
else:
    CLOUDINARY_STORAGE = {}

# Django 4.2+ : STORAGES remplace DEFAULT_FILE_STORAGE et STATICFILES_STORAGE
# Cloudinary pour les médias uniquement si les credentials sont présents
if _cloud_name and _api_key and _api_secret:
    STORAGES = {
        "default": {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        },
        "staticfiles": {
            # CompressedStaticFilesStorage au lieu de CompressedManifestStaticFilesStorage
            # pour éviter les erreurs de références CSS manquantes
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
        },
    }
else:
    # Fallback : stockage local (ne marche pas bien sur Railway car éphémère)
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
        },
    }

# Compatibilité django-cloudinary-storage (obsolète, utilise encore STATICFILES_STORAGE)
# Ce package n'est pas compatible Django 5+ sans ce hack
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

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
# Autorise tout sous-domaine Vercel (preview + prod) pour éviter de mettre à jour CORS à chaque déploiement.
CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://[\w-]+\.vercel\.app$"]
CORS_ALLOW_CREDENTIALS = True

# CSRF : origines de confiance pour les formulaires POST (admin, login, etc.). Format: https://domaine (sans slash final).
_csrf_origins = os.environ.get(
    "CSRF_TRUSTED_ORIGINS",
    "https://capitaloffusionversion5-production.up.railway.app,http://capitaloffusionversion5-production.up.railway.app",
)
CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf_origins.split(",") if o.strip()]

# Fichiers statiques (admin, etc.) : WhiteNoise les sert en prod après collectstatic.
STATIC_ROOT = BASE_DIR / "staticfiles"

# Base de données : DATABASE_URL (Railway/Supabase) prioritaire, sinon DB_* (PostgreSQL), sinon SQLite.
# On utilise os.environ directement (pas env) pour éviter qu'un .env présent dans l'image n'écrase la valeur Railway.
if os.environ.get("DATABASE_URL"):
    import environ
    _env = environ.Env()
    DATABASES = {"default": _env.db("DATABASE_URL")}  # _env vierge => lit uniquement os.environ
elif os.environ.get("DB_NAME") or os.environ.get("DB_HOST"):
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
