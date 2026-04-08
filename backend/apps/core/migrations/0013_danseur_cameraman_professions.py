# Generated manually — métiers annuaire artistes

from django.db import migrations


def add_professions(apps, schema_editor):
    DanceProfession = apps.get_model("core", "DanceProfession")
    for slug, name in (
        ("danseur", "Danseur"),
        ("cameraman", "Cameraman"),
    ):
        DanceProfession.objects.get_or_create(slug=slug, defaults={"name": name})


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0012_alter_pendingcontentedit_content_type"),
    ]

    operations = [
        migrations.RunPython(add_professions, noop_reverse),
    ]
