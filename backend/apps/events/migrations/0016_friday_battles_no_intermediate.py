"""Retire le niveau Intermediate des battles vendredi (erreur d'affiche)."""

from django.db import migrations


def forwards(apps, schema_editor):
    """
    Les compétitions vendredi n'ont pas de niveau workshop.
    Inputs: registry Django.
    Outputs: level vide sur les 2 créneaux battle.
    """
    Slot = apps.get_model("events", "FestivalProgramSlot")
    Slot.objects.filter(
        edition="2026",
        day_id="ven",
        category="competition",
        level="intermediate",
    ).update(level="")


def backwards(apps, schema_editor):
    """Rétablit Intermediate sur les battles vendredi."""
    Slot = apps.get_model("events", "FestivalProgramSlot")
    Slot.objects.filter(
        edition="2026",
        day_id="ven",
        category="competition",
        level="",
    ).update(level="intermediate")


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0015_announcement_kind_data"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
