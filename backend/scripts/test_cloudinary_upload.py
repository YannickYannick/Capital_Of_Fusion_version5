#!/usr/bin/env python3
"""
Upload d’une image locale vers Cloudinary.
Credentials : backend/.env → CLOUDINARY_URL ou CLOUDINARY_CLOUD_NAME + API_KEY + API_SECRET.
Usage : python scripts/test_cloudinary_upload.py <chemin_image>
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import environ

BACKEND_DIR = Path(__file__).resolve().parent.parent


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_cloudinary_upload.py <chemin_image>", file=sys.stderr)
        return 1

    image = Path(sys.argv[1]).expanduser().resolve()
    if not image.is_file():
        print(f"Fichier introuvable : {image}", file=sys.stderr)
        return 1

    env = environ.Env()
    env.read_env(BACKEND_DIR / ".env")

    url = env("CLOUDINARY_URL", default="").strip()
    name = env("CLOUDINARY_CLOUD_NAME", default="").strip()
    key = env("CLOUDINARY_API_KEY", default="").strip()
    secret = env("CLOUDINARY_API_SECRET", default="").strip()

    if url:
        os.environ.setdefault("CLOUDINARY_URL", url)
    if not (url or (name and key and secret)):
        print(
            "Variables manquantes : CLOUDINARY_URL ou les 3 "
            "CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET dans backend/.env",
            file=sys.stderr,
        )
        return 1

    import cloudinary
    import cloudinary.uploader

    if name and key and secret:
        cloudinary.config(cloud_name=name, api_key=key, api_secret=secret)

    result = cloudinary.uploader.upload(
        str(image),
        folder="test-uploads",
        use_filename=True,
        unique_filename=True,
    )
    out = result.get("secure_url") or result.get("url")
    print("Upload OK :", out)
    print("public_id :", result.get("public_id"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
