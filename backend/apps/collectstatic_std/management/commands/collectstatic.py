"""
cloudinary_storage enregistre sa propre commande collectstatic qui, si
STATICFILES_STORAGE != StaticCloudinaryStorage, ne copie pas les fichiers vers
STATIC_ROOT mais laisse quand même post_process (WhiteNoise) s'exécuter sur
tous les chemins découverts → FileNotFoundError sur Railway.

Cette commande doit être fournie par la PREMIÈRE app dans INSTALLED_APPS pour
qu'elle gagne dans django.core.management.get_commands() (parcours inversé).
"""
from django.contrib.staticfiles.management.commands.collectstatic import (
    Command as DjangoCollectstaticCommand,
)


class Command(DjangoCollectstaticCommand):
    pass
