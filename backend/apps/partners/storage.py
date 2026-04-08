"""
Stockage médias partenaires — Cloudinary en « raw » pour l’audio (MP3, OGG…).
MediaCloudinaryStorage par défaut force resource_type=image, d’où « Invalid image file ».
"""
from cloudinary_storage.storage import MediaCloudinaryStorage, RESOURCE_TYPES


class PartnerBackgroundMusicStorage(MediaCloudinaryStorage):
    """Upload Cloudinary en `raw` : fichiers audio pour `PartnerNode.background_music`."""

    RESOURCE_TYPE = RESOURCE_TYPES["RAW"]
