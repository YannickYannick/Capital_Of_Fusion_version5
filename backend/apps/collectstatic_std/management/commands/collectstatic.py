"""
cloudinary_storage enregistre sa propre commande collectstatic qui, si
STATICFILES_STORAGE != StaticCloudinaryStorage, ne copie pas les fichiers vers
STATIC_ROOT mais laisse quand même post_process (WhiteNoise) s'exécuter sur
tous les chemins découverts → FileNotFoundError sur Railway.

Cette commande doit être fournie par la PREMIÈRE app dans INSTALLED_APPS pour
qu'elle gagne dans django.core.management.get_commands() (parcours inversé).
"""
# region agent log
import json
import time

from django.conf import settings

# endregion
from django.contrib.staticfiles.management.commands.collectstatic import (
    Command as DjangoCollectstaticCommand,
)


class Command(DjangoCollectstaticCommand):
    def handle(self, *args, **options):
        # region agent log
        _log = {
            "sessionId": "8686e1",
            "runId": getattr(settings, "_DEBUG_RUN_ID", "pre-fix"),
            "hypothesisId": "H1",
            "location": "collectstatic_std/collectstatic.py:handle",
            "message": "using Django std collectstatic (not cloudinary_storage)",
            "data": {
                "staticfiles_storage_setting": getattr(
                    settings, "STATICFILES_STORAGE", None
                ),
                "storages_staticfiles": (
                    settings.STORAGES.get("staticfiles", {}).get("BACKEND")
                    if getattr(settings, "STORAGES", None)
                    else None
                ),
            },
            "timestamp": int(time.time() * 1000),
        }
        try:
            with open(
                settings.BASE_DIR.parent / "debug-8686e1.log",
                "a",
                encoding="utf-8",
            ) as _f:
                _f.write(json.dumps(_log, ensure_ascii=False) + "\n")
        except OSError:
            pass
        # endregion
        return super().handle(*args, **options)
