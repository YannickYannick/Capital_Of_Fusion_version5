# Met à jour name / name_fr / name_en / name_es pour Identité COF et sous-menus
# (get_or_create de 0021 ne remplit pas les lignes déjà existantes sans traductions).

from django.db import migrations


def forwards(apps, schema_editor):
    MenuItem = apps.get_model("core", "MenuItem")
    parent = MenuItem.objects.filter(slug="identite-cof", parent__isnull=True).first()
    if not parent:
        return

    MenuItem.objects.filter(pk=parent.pk).update(
        name="Identité COF",
        name_fr="Identité COF",
        name_en="COF identity",
        name_es="Identidad COF",
    )

    children = [
        {
            "slug": "identite-vision",
            "name": "Notre vision",
            "name_fr": "Notre vision",
            "name_en": "Our vision",
            "name_es": "Nuestra visión",
        },
        {
            "slug": "identite-histoire",
            "name": "Notre histoire",
            "name_fr": "Notre histoire",
            "name_en": "Our history",
            "name_es": "Nuestra historia",
        },
        {
            "slug": "identite-bulletins",
            "name": "Dernières informations",
            "name_fr": "Dernières informations",
            "name_en": "Latest updates",
            "name_es": "Últimas novedades",
        },
    ]

    for row in children:
        slug = row.pop("slug")
        MenuItem.objects.filter(slug=slug, parent_id=parent.id).update(**row)


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0021_identite_cof_menu_items"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
