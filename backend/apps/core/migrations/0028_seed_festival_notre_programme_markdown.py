# Contenu initial Markdown — page Festival / Notre programme (FR, EN, ES),
# aligné sur `pages.festivalNotreProgramme.defaultMarkdown` (frontend/messages).

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

    fr = _read_sidecar("content_festival_notre_programme_fr.md")
    en = _read_sidecar("content_festival_notre_programme_en.md")
    es = _read_sidecar("content_festival_notre_programme_es.md")

    SiteConfiguration.objects.filter(pk=config.pk).update(
        festival_notre_programme_markdown=fr or "",
        festival_notre_programme_markdown_fr=fr or "",
        festival_notre_programme_markdown_en=en or "",
        festival_notre_programme_markdown_es=es or "",
    )


def backwards(apps, schema_editor):
    SiteConfiguration = apps.get_model("core", "SiteConfiguration")
    config = SiteConfiguration.objects.first()
    if config:
        SiteConfiguration.objects.filter(pk=config.pk).update(
            festival_notre_programme_markdown="",
            festival_notre_programme_markdown_fr="",
            festival_notre_programme_markdown_en="",
            festival_notre_programme_markdown_es="",
        )


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0027_seed_identite_adn_festival_markdown"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
