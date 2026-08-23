# Description overlay Explore — planète Jack n' Jill Vibe (FR, EN, ES).
# Aligné sur frontend/src/data/festivalJackNJillFallback.ts

import json
from pathlib import Path

from django.db import migrations


def forwards(apps, schema_editor):
    """
    Inputs: apps registry Django.
    Outputs: OrganizationNode jack-n-jill-vibe mis à jour (description + CTA i18n).
    Purpose: traduire la section DESCRIPTION de l'overlay Explore.
    """
    OrganizationNode = apps.get_model("organization", "OrganizationNode")
    path = Path(__file__).resolve().parent / "planet_jack_n_jill_vibe_overlay.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except OSError:
        return

    desc = data.get("description") or {}
    cta_text = data.get("cta_text") or {}
    cta_url = (data.get("cta_url") or "").strip()

    updated = OrganizationNode.objects.filter(slug="jack-n-jill-vibe").update(
        description=desc.get("fr") or "",
        description_fr=desc.get("fr") or "",
        description_en=desc.get("en") or "",
        description_es=desc.get("es") or "",
        cta_text=cta_text.get("fr") or "",
        cta_text_fr=cta_text.get("fr") or "",
        cta_text_en=cta_text.get("en") or "",
        cta_text_es=cta_text.get("es") or "",
        cta_url=cta_url,
    )
    if updated == 0:
        return


def backwards(apps, schema_editor):
    OrganizationNode = apps.get_model("organization", "OrganizationNode")
    OrganizationNode.objects.filter(slug="jack-n-jill-vibe").update(
        description="",
        description_fr="",
        description_en="",
        description_es="",
        cta_text="En savoir plus",
        cta_text_fr="En savoir plus",
        cta_text_en="",
        cta_text_es="",
        cta_url="",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0011_refresh_all_star_overlay_poster"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
