"""
Configuration production — DEBUG False, DB, ALLOWED_HOSTS et CORS via env.
Usage: DJANGO_SETTINGS_MODULE=config.settings.production
"""
from .base import *  # noqa: F401, F403
import os

DEBUG = False

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "capitaloffusionversion5-production.up.railway.app").split(",")
    if h.strip()
]

# CORS : origines autorisées (URL du front Vercel). Ex: https://mon-site.vercel.app,https://capitaloffusion.fr
_cors = os.environ.get("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors.split(",") if o.strip()]
CORS_ALLOW_CREDENTIALS = True

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
