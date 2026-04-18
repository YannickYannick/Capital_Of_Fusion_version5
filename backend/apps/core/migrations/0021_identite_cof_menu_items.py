# Données : Identité COF + sous-menus (alignés Navbar / load_initial_data + Notre histoire).

from django.db import migrations


def forwards(apps, schema_editor):
    MenuItem = apps.get_model("core", "MenuItem")

    parent, _ = MenuItem.objects.get_or_create(
        slug="identite-cof",
        parent=None,
        defaults={
            "name": "Identité COF",
            "name_fr": "Identité COF",
            "name_en": "COF identity",
            "name_es": "Identidad COF",
            "url": "/identite-cof/",
            "icon": "",
            "order": 1,
            "is_active": True,
        },
    )

    children = [
        {
            "slug": "identite-vision",
            "name": "Notre vision",
            "name_fr": "Notre vision",
            "name_en": "Our vision",
            "name_es": "Nuestra visión",
            "url": "/identite-cof/notre-vision",
            "order": 1,
        },
        {
            "slug": "identite-histoire",
            "name": "Notre histoire",
            "name_fr": "Notre histoire",
            "name_en": "Our history",
            "name_es": "Nuestra historia",
            "url": "/identite-cof/notre-histoire",
            "order": 2,
        },
        {
            "slug": "identite-bulletins",
            "name": "Dernières informations",
            "name_fr": "Dernières informations",
            "name_en": "Latest updates",
            "name_es": "Últimas novedades",
            "url": "/identite-cof/bulletins",
            "order": 3,
        },
    ]

    for row in children:
        MenuItem.objects.get_or_create(
            slug=row["slug"],
            parent=parent,
            defaults={
                "name": row["name"],
                "name_fr": row["name_fr"],
                "name_en": row["name_en"],
                "name_es": row["name_es"],
                "url": row["url"],
                "icon": "",
                "order": row["order"],
                "is_active": True,
            },
        )


def backwards(apps, schema_editor):
    MenuItem = apps.get_model("core", "MenuItem")
    MenuItem.objects.filter(slug="identite-cof", parent__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0020_faqitem"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
