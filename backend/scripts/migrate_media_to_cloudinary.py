#!/usr/bin/env python
"""
Migre les fichiers médias locaux vers Cloudinary.
Parcourt les utilisateurs avec profile_picture ou cover_image local,
uploade sur Cloudinary, et met à jour le champ en base.

Usage:
  cd backend
  python scripts/migrate_media_to_cloudinary.py

Dry-run (affiche sans modifier):
  python scripts/migrate_media_to_cloudinary.py --dry-run
"""
import os
import sys
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

import django
django.setup()

import cloudinary.uploader as uploader
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()
MEDIA_ROOT = Path(settings.MEDIA_ROOT)


def is_local_path(value: str) -> bool:
    """Retourne True si la valeur est un chemin local (pas une URL Cloudinary)."""
    if not value:
        return False
    s = str(value)
    # Déjà une URL Cloudinary ou autre URL complète
    if s.startswith("http://") or s.startswith("https://"):
        return False
    return True


def upload_to_cloudinary(local_path: str, folder: str) -> str | None:
    """
    Uploade un fichier local vers Cloudinary.
    Retourne l'URL sécurisée ou None si échec.
    """
    full_path = MEDIA_ROOT / local_path
    if not full_path.exists():
        print(f"  [SKIP] Fichier local introuvable: {full_path}")
        return None
    
    try:
        # Utilise le nom du fichier (sans extension) comme public_id
        filename = Path(local_path).stem
        result = uploader.upload(
            str(full_path),
            folder=folder,
            public_id=filename,
            overwrite=True,
            resource_type="image",
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"  [ERROR] Upload échoué pour {local_path}: {e}")
        return None


def migrate_user_images(dry_run: bool = False):
    """Migre profile_picture et cover_image des utilisateurs."""
    users = User.objects.all()
    migrated = 0
    skipped = 0
    errors = 0

    for user in users:
        changes = {}

        # Profile picture
        pp = str(user.profile_picture) if user.profile_picture else ""
        if is_local_path(pp):
            print(f"[USER {user.username}] profile_picture: {pp}")
            if dry_run:
                print(f"  [DRY-RUN] Serait uploadé vers Cloudinary")
            else:
                url = upload_to_cloudinary(pp, "profiles")
                if url:
                    changes["profile_picture"] = url
                    print(f"  [OK] -> {url}")
                else:
                    errors += 1

        # Cover image
        ci = str(user.cover_image) if user.cover_image else ""
        if is_local_path(ci):
            print(f"[USER {user.username}] cover_image: {ci}")
            if dry_run:
                print(f"  [DRY-RUN] Serait uploadé vers Cloudinary")
            else:
                url = upload_to_cloudinary(ci, "profiles/covers")
                if url:
                    changes["cover_image"] = url
                    print(f"  [OK] -> {url}")
                else:
                    errors += 1

        if changes and not dry_run:
            for field, value in changes.items():
                setattr(user, field, value)
            user.save(update_fields=list(changes.keys()))
            migrated += 1
        elif not changes:
            skipped += 1

    print("\n" + "=" * 50)
    print(f"Migration terminée:")
    print(f"  - Migrés: {migrated}")
    print(f"  - Ignorés (déjà Cloudinary ou vide): {skipped}")
    print(f"  - Erreurs: {errors}")


def migrate_partner_images(dry_run: bool = False):
    """Migre les images des modèles partenaires (optionnel)."""
    from apps.partners.models import Partner, PartnerNode, PartnerEvent, PartnerCourse

    models_fields = [
        (Partner, ["logo"]),
        (PartnerNode, ["cover_image"]),
        (PartnerEvent, ["image"]),
        (PartnerCourse, ["image"]),
    ]

    for Model, fields in models_fields:
        for obj in Model.objects.all():
            changes = {}
            for field in fields:
                val = getattr(obj, field, None)
                if val and is_local_path(str(val)):
                    print(f"[{Model.__name__} {obj.pk}] {field}: {val}")
                    if dry_run:
                        print(f"  [DRY-RUN] Serait uploadé")
                    else:
                        folder = f"partners/{Model.__name__.lower()}"
                        url = upload_to_cloudinary(str(val), folder)
                        if url:
                            changes[field] = url
                            print(f"  [OK] -> {url}")

            if changes and not dry_run:
                for field, value in changes.items():
                    setattr(obj, field, value)
                obj.save(update_fields=list(changes.keys()))


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print("=== MODE DRY-RUN (aucune modification) ===\n")
    else:
        print("=== MIGRATION VERS CLOUDINARY ===\n")
        confirm = input("Continuer? (y/N): ")
        if confirm.lower() != "y":
            print("Annulé.")
            sys.exit(0)

    print("\n--- Utilisateurs (profile_picture, cover_image) ---")
    migrate_user_images(dry_run)

    print("\n--- Partenaires (logos, images) ---")
    migrate_partner_images(dry_run)

    print("\nTerminé!")
