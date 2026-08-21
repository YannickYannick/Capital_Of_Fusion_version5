# Refresh Markdown Accès & Venue — ajout plan d'ensemble area1-2.png après l'adresse.

from pathlib import Path

from django.db import migrations


def _read_sidecar(name: str) -> str:
    """
    Inputs: nom de fichier sidecar (.md).
    Outputs: contenu UTF-8 ou chaîne vide.
    Purpose: recharger le Markdown seed après mise à jour des images.
    """
    p = Path(__file__).resolve().parent / name
    try:
        return p.read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def forwards(apps, schema_editor):
    """
    Inputs: apps Django.
    Outputs: champs festival_acces_venue_markdown_* mis à jour.
    Purpose: publier le plan Area 1&2 juste après l'adresse.
    """
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
    """Pas de rollback (refresh idempotent)."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0033_alter_festival_acces_venue_help_text"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
