"""
Configuration développement local — SQLite, DEBUG True.
Usage: DJANGO_SETTINGS_MODULE=config.settings.local

Si les 3 variables Cloudinary sont dans backend/.env, les médias vont aussi sur Cloudinary
(même ordre INSTALLED_APPS qu’en prod). Sans elles, stockage local (MEDIA_ROOT).
"""
from .base import *  # noqa: F401, F403
import os

DEBUG = True

_cn = os.environ.get("CLOUDINARY_CLOUD_NAME", "").strip()
_key = os.environ.get("CLOUDINARY_API_KEY", "").strip()
_secret = os.environ.get("CLOUDINARY_API_SECRET", "").strip()
if _cn and _key and _secret:
    _lapps = list(INSTALLED_APPS)
    _si = _lapps.index("django.contrib.staticfiles")
    INSTALLED_APPS = (
        _lapps[:_si] + ["cloudinary_storage", "cloudinary"] + _lapps[_si:]
    )
    CLOUDINARY_STORAGE = {
        "CLOUD_NAME": _cn,
        "API_KEY": _key,
        "API_SECRET": _secret,
    }
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
