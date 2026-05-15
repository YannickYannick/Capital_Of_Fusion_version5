# Même contenu overlay que 0009, mais cible plusieurs slugs / heuristique « All Star battle » :
# la prod peut utiliser un slug différent de all-star-street-bachata-battle.

import json
from pathlib import Path

from django.db.models import Q
from django.db import migrations


SLUG_VARIANTS = (
    "all-star-street-bachata-battle",
    "all-star-street-battle",
    "all-star-street-battle-bachata",
    "all-star-battle",
    "street-bachata-battle",
    "street-bachata-all-star-battle",
)


def _candidate_qs(apps):
    OrganizationNode = apps.get_model("organization", "OrganizationNode")
    qs = OrganizationNode.objects.filter(slug__in=SLUG_VARIANTS)
    if qs.exists():
        return qs

    return OrganizationNode.objects.filter(type="BRANCH").filter(
        (Q(slug__icontains="all-star") & Q(slug__icontains="battle"))
        | (Q(slug__icontains="all_star") & Q(slug__icontains="battle"))
        | (Q(name__icontains="all star") & Q(name__icontains="battle"))
    )


def forwards(apps, schema_editor):
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

    qs = _candidate_qs(apps)
    if not qs.exists():
        return

    qs.update(
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


def backwards(apps, schema_editor):
    OrganizationNode = apps.get_model("organization", "OrganizationNode")
    qs = _candidate_qs(apps)
    if not qs.exists():
        return
    qs.update(
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
        ("organization", "0009_seed_all_star_street_planet_descriptions"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
