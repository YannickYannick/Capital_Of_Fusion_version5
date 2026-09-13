# Accord féminin — « Venue officielle & Zones » (Markdown FR Accès & Venue).

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

    fr = _read_sidecar("content_festival_acces_venue_fr.md")
    en = _read_sidecar("content_festival_acces_venue_en.md")
    es = _read_sidecar("content_festival_acces_venue_es.md")

    SiteConfiguration.objects.filter(pk=config.pk).update(
        festival_acces_venue_markdown=fr or "",
        festival_acces_venue_markdown_fr=fr or "",
        festival_acces_venue_markdown_en=en or "",
        festival_acces_venue_markdown_es=es or "",
    )


def backwards(apps, schema_editor):
    """Pas de rollback du contenu (refresh idempotent)."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0040_refresh_festival_jack_n_jill_markdown_posters"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
