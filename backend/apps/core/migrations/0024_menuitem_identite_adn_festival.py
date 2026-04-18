# Sous-menu « ADN du festival » sous Identité COF.

from django.db import migrations


def forwards(apps, schema_editor):
    MenuItem = apps.get_model("core", "MenuItem")
    parent = MenuItem.objects.filter(slug="identite-cof", parent__isnull=True).first()
    if not parent:
        return
    MenuItem.objects.get_or_create(
        slug="identite-adn-festival",
        parent=parent,
        defaults={
            "name": "ADN du festival",
            "name_fr": "ADN du festival",
            "name_en": "Festival DNA",
            "name_es": "ADN del festival",
            "url": "/identite-cof/adn-du-festival",
            "icon": "",
            "order": 4,
            "is_active": True,
        },
    )


def backwards(apps, schema_editor):
    MenuItem = apps.get_model("core", "MenuItem")
    parent = MenuItem.objects.filter(slug="identite-cof", parent__isnull=True).first()
    if parent:
        MenuItem.objects.filter(slug="identite-adn-festival", parent_id=parent.id).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0023_identite_adn_festival_markdown"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
