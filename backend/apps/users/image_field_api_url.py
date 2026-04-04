"""URLs exposées API pour ImageField (fichier local ou Cloudinary)."""
from urllib.parse import urlparse


def strip_embedded_absolute_url(url: str) -> str:
    """
    Si l’ImageField contient déjà une URL absolue, django-cloudinary-storage peut
    générer .../upload/.../media/https://... (URL collée comme public_id).
    """
    if not url:
        return url
    s = str(url)
    for marker in ("/media/https://", "/media/http://"):
        if marker in s:
            rest = s.split(marker, 1)[1]
            return ("https://" if "https://" in marker else "http://") + rest
    return s


def https_media_url(url: str, request) -> str:
    """Évite le mixed content : http → https pour notre hôte / Railway."""
    if not url or not str(url).startswith("http://"):
        return url
    s = str(url)
    try:
        host = urlparse(s).netloc
    except ValueError:
        return url
    req_host = (request.get_host() if request else "") or ""
    if req_host and host == req_host.split(":")[0]:
        return "https://" + s[7:]
    if host.endswith(".up.railway.app") or host.endswith(".railway.app"):
        return "https://" + s[7:]
    return url


def serialize_image_field_for_api(field_file, request):
    """
    URL absolue pour l’API (profil, couverture, etc.).
    `request` peut être None (URLs relatives pour chemins locaux).
    """
    if not field_file:
        return None
    raw_name = (field_file.name if hasattr(field_file, "name") else "") or ""
    if raw_name.startswith("http://") or raw_name.startswith("https://"):
        return https_media_url(strip_embedded_absolute_url(raw_name), request)
    if raw_name.startswith("//"):
        return strip_embedded_absolute_url("https:" + raw_name)
    try:
        url = field_file.url
    except ValueError:
        return None
    url = strip_embedded_absolute_url(url)
    if url.startswith("http://") or url.startswith("https://"):
        return https_media_url(url, request)
    if request:
        return https_media_url(request.build_absolute_uri(url), request)
    return url
