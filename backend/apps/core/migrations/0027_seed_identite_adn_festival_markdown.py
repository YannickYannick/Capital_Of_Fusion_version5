# Contenu initial Markdown — page Identité COF / ADN du festival (FR, EN, ES).

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

    fr = _read_sidecar("content_identite_adn_fr.md")
    en = _read_sidecar("content_identite_adn_en.md")
    es = _read_sidecar("content_identite_adn_es.md")

    SiteConfiguration.objects.filter(pk=config.pk).update(
        identite_adn_festival_markdown=fr or "",
        identite_adn_festival_markdown_fr=fr or "",
        identite_adn_festival_markdown_en=en or "",
        identite_adn_festival_markdown_es=es or "",
    )


def backwards(apps, schema_editor):
    SiteConfiguration = apps.get_model("core", "SiteConfiguration")
    config = SiteConfiguration.objects.first()
    if config:
        SiteConfiguration.objects.filter(pk=config.pk).update(
            identite_adn_festival_markdown="",
            identite_adn_festival_markdown_fr="",
            identite_adn_festival_markdown_en="",
            identite_adn_festival_markdown_es="",
        )


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0026_menuitem_is_visible"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
