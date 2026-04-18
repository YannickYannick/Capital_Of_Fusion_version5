# ADN du festival (ordre 3) avant Dernières informations (ordre 4).

from django.db import migrations


def forwards(apps, schema_editor):
    MenuItem = apps.get_model("core", "MenuItem")
    parent = MenuItem.objects.filter(slug="identite-cof", parent__isnull=True).first()
    if not parent:
        return
    MenuItem.objects.filter(slug="identite-adn-festival", parent_id=parent.id).update(order=3)
    MenuItem.objects.filter(slug="identite-bulletins", parent_id=parent.id).update(order=4)


def backwards(apps, schema_editor):
    MenuItem = apps.get_model("core", "MenuItem")
    parent = MenuItem.objects.filter(slug="identite-cof", parent__isnull=True).first()
    if not parent:
        return
    MenuItem.objects.filter(slug="identite-bulletins", parent_id=parent.id).update(order=3)
    MenuItem.objects.filter(slug="identite-adn-festival", parent_id=parent.id).update(order=4)


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0024_menuitem_identite_adn_festival"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
