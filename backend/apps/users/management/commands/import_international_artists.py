from __future__ import annotations

from io import BytesIO
from pathlib import Path, PurePath

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify

from apps.core.models import DanceProfession


User = get_user_model()


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
# Limite typique Cloudinary « free » ; recompression PIL si dépassement.
MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024


def bytes_for_profile_upload(src: Path, max_bytes: int = MAX_PROFILE_IMAGE_BYTES) -> tuple[bytes, str]:
    """Retourne les octets et un nom de fichier prêts pour ImageField (JPEG si recompression)."""
    try:
        size = src.stat().st_size
    except OSError:
        return b"", src.name
    if size <= max_bytes:
        return src.read_bytes(), PurePath(src.name).name

    from PIL import Image

    out_name = f"{PurePath(src.name).stem}.jpg"
    img = Image.open(src)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    max_dim = min(2048, max(img.size))
    quality = 88
    while max_dim >= 480:
        thumb = img.copy()
        thumb.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        q = quality
        while q >= 50:
            buf = BytesIO()
            thumb.save(buf, format="JPEG", quality=q, optimize=True)
            data = buf.getvalue()
            if len(data) <= max_bytes:
                return data, out_name
            q -= 6
        max_dim = int(max_dim * 0.82)

    thumb = img.copy()
    thumb.thumbnail((640, 640), Image.Resampling.LANCZOS)
    buf = BytesIO()
    thumb.save(buf, format="JPEG", quality=40, optimize=True)
    return buf.getvalue(), out_name


def pick_image_file(folder: Path) -> Path | None:
    """
    Choisit une image dans le dossier artiste, y compris sous-dossiers (ex. Photos/, Passeport(s)/).
    Privilégie les chemins « photo », évite les scans de passeport, puis taille / nom « profile ».
    """
    files: list[Path] = []
    for p in folder.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in IMAGE_EXTS:
            continue
        parts_l = [x.lower() for x in p.parts]
        if "__macosx" in parts_l:
            continue
        files.append(p)
    if not files:
        return None
    scored = []
    for p in files:
        name = p.name.lower()
        path_s = str(p).lower()
        score = 0
        if "profile" in name or "profil" in name:
            score += 10_000_000
        stem = Path(name).stem.lower()
        if stem == "pp" or stem.startswith("pp-") or stem.endswith("-pp"):
            score += 10_000_000
        if "passeport" in path_s or "passport" in name or "passeport" in name:
            score -= 8_000_000
        if "photo" in path_s and "passeport" not in path_s:
            score += 3_000_000
        try:
            sz = p.stat().st_size
        except OSError:
            sz = 0
        if sz > 0 and sz <= MAX_PROFILE_IMAGE_BYTES:
            score += 5_000_000
        elif sz > MAX_PROFILE_IMAGE_BYTES:
            # Fichiers très lourds : PIL + upload risquent d’échouer ; préférer le plus petit.
            score -= min(sz // 80_000, 6_000_000)
        else:
            score += min(sz, 800_000)
        scored.append((score, p))
    scored.sort(key=lambda t: t[0], reverse=True)
    return scored[0][1]


def unique_username(base: str) -> str:
    base = (base or "").strip() or "artiste"
    base = slugify(base) or "artiste"
    username = base[:150]
    if not User.objects.filter(username=username).exists():
        return username
    i = 2
    while True:
        candidate = f"{base}-{i}"[:150]
        if not User.objects.filter(username=candidate).exists():
            return candidate
        i += 1


def slug_username_for_folder(display_name: str) -> str:
    s = slugify((display_name or "").strip()) or "artiste"
    return s[:150]


def find_artist_user_for_folder(display_name: str) -> User | None:
    """Réutilise un compte artiste existant (évite dario-sara-2, dario-sara-3…)."""
    slug_u = slug_username_for_folder(display_name)
    q = User.objects.filter(user_type=User.UserType.STAFF, staff_role=User.StaffRole.ARTIST)
    u = q.filter(username=slug_u).first()
    if u:
        return u
    return q.filter(first_name__iexact=display_name.strip()).first()


class Command(BaseCommand):
    help = "Importe des artistes depuis un dossier (nom = dossier, photo = image si présente)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dir",
            required=True,
            help="Chemin du dossier contenant 1 sous-dossier par artiste (images cherchées aussi dans les sous-dossiers).",
        )

    def handle(self, *args, **options):
        root = Path(options["dir"]).expanduser()
        if not root.exists() or not root.is_dir():
            raise CommandError(f"Dossier introuvable: {root}")

        try:
            prof = DanceProfession.objects.get(slug="danseur")
        except DanceProfession.DoesNotExist as e:
            raise CommandError("La profession 'danseur' (slug=danseur) n'existe pas.") from e

        created = 0
        updated = 0
        with_photo = 0

        artist_dirs = sorted([p for p in root.iterdir() if p.is_dir()], key=lambda p: p.name.lower())
        if not artist_dirs:
            raise CommandError(f"Aucun sous-dossier artiste trouvé dans: {root}")

        for d in artist_dirs:
            display_name = d.name.strip()
            if not display_name:
                continue

            user = find_artist_user_for_folder(display_name)
            was_created = False
            if user is None:
                username = unique_username(display_name)
                user, was_created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        "first_name": display_name,
                        "last_name": "",
                        "email": "",
                        "user_type": "STAFF",
                        "staff_role": "ARTIST",
                        "account_status": "APPROVED",
                    },
                )
                if was_created:
                    user.set_unusable_password()
                    created += 1
                else:
                    if not user.first_name:
                        user.first_name = display_name
                    updated += 1
            else:
                if not user.first_name:
                    user.first_name = display_name
                updated += 1

            user.professions.set([prof])

            img = pick_image_file(d)
            if img and not user.profile_picture:
                try:
                    data, out_base = bytes_for_profile_upload(img)
                    if not data:
                        raise OSError("fichier image illisible ou vide")
                    safe_name = f"{user.username}_{out_base}"
                    user.profile_picture.save(safe_name, ContentFile(data), save=False)
                    with_photo += 1
                except OSError as exc:
                    self.stderr.write(f"Photo ignorée ({display_name}): {exc}")
                except Exception as exc:
                    self.stderr.write(f"Photo ignorée ({display_name}): {exc}")

            user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Import terminé — créés: {created}, existants/maj: {updated}, avec photo ajoutée: {with_photo}."
            )
        )
