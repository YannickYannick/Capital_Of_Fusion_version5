# Données : danseur / cameraman avaient parfois name vide → pastilles sans libellé (formulaire artiste).

from django.db import migrations


def fix_names(apps, schema_editor):
    DanceProfession = apps.get_model("core", "DanceProfession")
    for slug, label in (("danseur", "Danseur"), ("cameraman", "Cameraman")):
        DanceProfession.objects.filter(slug=slug).update(name=label)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0017_replace_artiste_with_book_hotel"),
    ]

    operations = [
        migrations.RunPython(fix_names, noop_reverse),
    ]
