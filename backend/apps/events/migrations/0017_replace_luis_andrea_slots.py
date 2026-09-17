"""Remplace les 3 créneaux Luis & Andrea (annulation)."""

from django.db import migrations


REPLACEMENTS = [
    {
        "match": {
            "edition": "2026",
            "day_id": "ven",
            "room": "La Casa Room",
            "start_time": "20:00",
            "title": "Luis & Andrea",
        },
        "update": {
            "title": "David & Ines",
            "style": "Bachata Fusion",
            "level": "open",
            "not_in_full_pass": False,
        },
    },
    {
        "match": {
            "edition": "2026",
            "day_id": "sam",
            "room": "El Patio Room",
            "start_time": "14:00",
            "title": "Luis & Andrea",
        },
        "update": {
            "title": "Mika & Liza",
            "style": "Brazilian Zouk · Tilt & Twist – Upper Body Movements",
            "level": "advanced",
            "not_in_full_pass": True,
        },
    },
    {
        "match": {
            "edition": "2026",
            "day_id": "sam",
            "room": "La Casa Room",
            "start_time": "15:00",
            "title": "Luis & Andrea",
        },
        "update": {
            "title": "Claudio & Manue",
            "style": "Theme TBA",
            "level": "intermediate",
            "not_in_full_pass": False,
        },
    },
]


def forwards(apps, schema_editor):
    """
    Met à jour les 3 workshops Luis & Andrea + retire le duo du lineup.
    Inputs: registry Django.
    Outputs: créneaux remplacés ; username luis-andrea sans rôle artiste.
    """
    Slot = apps.get_model("events", "FestivalProgramSlot")
    for item in REPLACEMENTS:
        Slot.objects.filter(**item["match"]).update(**item["update"])

    User = apps.get_model("users", "User")
    User.objects.filter(username="luis-andrea").update(staff_role="")


def backwards(apps, schema_editor):
    """Rétablit Luis & Andrea sur les 3 créneaux + rôle artiste."""
    Slot = apps.get_model("events", "FestivalProgramSlot")
    reverse = [
        (
            {"edition": "2026", "day_id": "ven", "room": "La Casa Room", "start_time": "20:00", "title": "David & Ines"},
            {"title": "Luis & Andrea", "style": "Sensual Bachata", "level": "open", "not_in_full_pass": False},
        ),
        (
            {"edition": "2026", "day_id": "sam", "room": "El Patio Room", "start_time": "14:00", "title": "Mika & Liza"},
            {
                "title": "Luis & Andrea",
                "style": "Sensual Bachata Masterclass",
                "level": "advanced",
                "not_in_full_pass": True,
            },
        ),
        (
            {
                "edition": "2026",
                "day_id": "sam",
                "room": "La Casa Room",
                "start_time": "15:00",
                "title": "Claudio & Manue",
            },
            {
                "title": "Luis & Andrea",
                "style": "Sensual Bachata",
                "level": "intermediate",
                "not_in_full_pass": False,
            },
        ),
    ]
    for match, update in reverse:
        Slot.objects.filter(**match).update(**update)

    User = apps.get_model("users", "User")
    User.objects.filter(username="luis-andrea").update(staff_role="ARTIST")


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0016_friday_battles_no_intermediate"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
