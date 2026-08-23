# Refresh Markdown Accès & Venue — retrait du drapeau 🇫🇷 sur Social French Cup pré-sélections (samedi).

from pathlib import Path

from django.db import migrations


def _read_sidecar(name: str) -> str:
    """
    Inputs: nom de fichier sidecar (.md).
    Outputs: contenu UTF-8 ou chaîne vide.
    Purpose: recharger le Markdown seed après correction libellé samedi.
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
    Purpose: synchroniser le contenu Accès & Venue sans 🇫🇷 sur la pré-sélection du samedi.
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
        ("core", "0035_seed_festival_jack_n_jill_markdown"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
