# Contenu Markdown — page Festival / Accès & Venue (FR, EN, ES).
# Aligné sur frontend/src/data/festivalAccesVenueFallback.ts

from pathlib import Path

from django.db import migrations


def _read_sidecar(name: str) -> str:
    """
    Inputs: nom de fichier sidecar (.md) à côté de cette migration.
    Outputs: contenu texte UTF-8, ou chaîne vide si absent.
    Purpose: charger le Markdown seed sans le coller dans le .py.
    """
    p = Path(__file__).resolve().parent / name
    try:
        return p.read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def forwards(apps, schema_editor):
    """
    Inputs: apps registry Django.
    Outputs: SiteConfiguration mise à jour (champs acces_venue FR/EN/ES).
    Purpose: publier le contenu Officiel Venue & Areas en base.
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
    """
    Inputs: apps registry Django.
    Outputs: champs acces_venue vidés.
    Purpose: rollback du seed.
    """
    SiteConfiguration = apps.get_model("core", "SiteConfiguration")
    config = SiteConfiguration.objects.first()
    if config:
        SiteConfiguration.objects.filter(pk=config.pk).update(
            festival_acces_venue_markdown="",
            festival_acces_venue_markdown_fr="",
            festival_acces_venue_markdown_en="",
            festival_acces_venue_markdown_es="",
        )


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0031_refresh_all_star_street_battle_markdown_poster"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
