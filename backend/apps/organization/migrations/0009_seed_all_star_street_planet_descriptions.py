import json
from pathlib import Path

from django.db import migrations


def forwards(apps, schema_editor):
    OrganizationNode = apps.get_model("organization", "OrganizationNode")
    path = Path(__file__).resolve().parent / "planet_all_star_street_battle_overlay.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except OSError:
        return

    short_desc = data.get("short_description") or {}
    desc = data.get("description") or {}
    content = data.get("content") or {}
    cta_text = data.get("cta_text") or {}
    cta_url = (data.get("cta_url") or "").strip()

    updated = OrganizationNode.objects.filter(slug="all-star-street-bachata-battle").update(
        short_description=short_desc.get("fr") or "",
        short_description_fr=short_desc.get("fr") or "",
        short_description_en=short_desc.get("en") or "",
        short_description_es=short_desc.get("es") or "",
        description=desc.get("fr") or "",
        description_fr=desc.get("fr") or "",
        description_en=desc.get("en") or "",
        description_es=desc.get("es") or "",
        content=content.get("fr") or "",
        content_fr=content.get("fr") or "",
        content_en=content.get("en") or "",
        content_es=content.get("es") or "",
        cta_text=cta_text.get("fr") or "",
        cta_text_fr=cta_text.get("fr") or "",
        cta_text_en=cta_text.get("en") or "",
        cta_text_es=cta_text.get("es") or "",
        cta_url=cta_url,
    )
    if updated == 0:
        # Déploiements sans ce slug : pas d’erreur, l’admin pourra créer le nœud à la main.
        return


def backwards(apps, schema_editor):
    OrganizationNode = apps.get_model("organization", "OrganizationNode")
    OrganizationNode.objects.filter(slug="all-star-street-bachata-battle").update(
        short_description="",
        short_description_fr="",
        short_description_en="",
        short_description_es="",
        description="",
        description_fr="",
        description_en="",
        description_es="",
        content="",
        content_fr="",
        content_en="",
        content_es="",
        cta_text="",
        cta_text_fr="",
        cta_text_en="",
        cta_text_es="",
        cta_url="",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0008_organizationnode_explore_order"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
