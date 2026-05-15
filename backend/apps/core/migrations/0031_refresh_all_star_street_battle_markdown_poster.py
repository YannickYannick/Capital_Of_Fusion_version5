# Image affiche dans le contenu Markdown All Star Street Battle (FR / EN / ES).

from pathlib import Path

from django.db import migrations


def _read_sidecar(name: str) -> str:
    p = Path(__file__).resolve().parent / name
    try:
        return p.read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def forwards(apps, schema_editor):
    SiteConfiguration = apps.get_model("core", "SiteConfiguration")
    config = SiteConfiguration.objects.first()
    if not config:
        config = SiteConfiguration.objects.create()

    fr = _read_sidecar("content_festival_all_star_street_battle_fr.md")
    en = _read_sidecar("content_festival_all_star_street_battle_en.md")
    es = _read_sidecar("content_festival_all_star_street_battle_es.md")

    SiteConfiguration.objects.filter(pk=config.pk).update(
        festival_all_star_street_battle_markdown=fr or "",
        festival_all_star_street_battle_markdown_fr=fr or "",
        festival_all_star_street_battle_markdown_en=en or "",
        festival_all_star_street_battle_markdown_es=es or "",
    )


def backwards(apps, schema_editor):
    """Pas de rollback du contenu (refresh idempotent)."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0030_seed_festival_all_star_street_battle_markdown"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
