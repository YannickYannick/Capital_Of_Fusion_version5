"""Ajoute les 4 créneaux Hotel Day Socials (salle Hotel)."""

from datetime import date

from django.db import migrations

HOTEL_SLOTS = [
    {
        "day_id": "jeu",
        "day_label": "Jeudi",
        "day_date": "17 sept.",
        "iso_date": date(2026, 9, 17),
        "start_time": "14:00",
        "end_time": "17:00",
    },
    {
        "day_id": "ven",
        "day_label": "Vendredi",
        "day_date": "18 sept.",
        "iso_date": date(2026, 9, 18),
        "start_time": "13:00",
        "end_time": "18:30",
    },
    {
        "day_id": "sam",
        "day_label": "Samedi",
        "day_date": "19 sept.",
        "iso_date": date(2026, 9, 19),
        "start_time": "13:30",
        "end_time": "18:00",
    },
    {
        "day_id": "dim",
        "day_label": "Dimanche",
        "day_date": "20 sept.",
        "iso_date": date(2026, 9, 20),
        "start_time": "15:00",
        "end_time": "20:00",
    },
]


def forwards(apps, schema_editor):
    """
    Crée / met à jour les Hotel Day Socials par jour.
    Inputs: registry Django.
    Outputs: 4 créneaux room=Hotel.
    """
    Slot = apps.get_model("events", "FestivalProgramSlot")
    for row in HOTEL_SLOTS:
        Slot.objects.update_or_create(
            edition="2026",
            day_id=row["day_id"],
            room="Hotel",
            start_time=row["start_time"],
            title="Hotel Day Socials",
            defaults={
                "day_label": row["day_label"],
                "day_date": row["day_date"],
                "iso_date": row["iso_date"],
                "end_time": row["end_time"],
                "style": "Partner hotel · Meudon",
                "level": "",
                "category": "social",
                "is_live": False,
                "not_in_full_pass": False,
                "sort_order": 0,
            },
        )


def backwards(apps, schema_editor):
    """Supprime les créneaux Hotel Day Socials."""
    Slot = apps.get_model("events", "FestivalProgramSlot")
    Slot.objects.filter(edition="2026", room="Hotel", title="Hotel Day Socials").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0018_announcement_badge_label"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
