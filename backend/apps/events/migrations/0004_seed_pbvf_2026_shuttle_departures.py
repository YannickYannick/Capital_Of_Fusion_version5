"""Seed horaires navettes PBVF 2026 depuis affiches officielles."""

from datetime import date

from django.db import migrations

SHUTTLE_DAYS = [
    {
        "day_id": "jeu",
        "day_label": "Jeudi",
        "day_date": "17 sept.",
        "iso_date": date(2026, 9, 17),
        "to_hotel": ["14:30", "15:30", "22:45", "00:00", "02:00", "04:00"],
        "to_palmeraie": ["17:30", "18:30", "19:30", "20:30", "22:00", "23:00", "23:30", "00:00", "01:00"],
    },
    {
        "day_id": "ven",
        "day_label": "Vendredi",
        "day_date": "18 sept.",
        "iso_date": date(2026, 9, 18),
        "to_hotel": [
            "13:00", "14:00", "16:00", "16:15", "17:00", "17:15", "19:15", "20:00",
            "21:00", "21:15", "22:00", "23:00", "23:45", "00:00", "00:45", "01:00",
            "02:45", "03:00", "04:00", "04:45", "05:00", "05:45",
        ],
        "to_palmeraie": [
            "13:30", "15:30", "16:30", "19:30", "20:30", "21:30", "22:30",
            "23:00", "23:30", "00:00", "00:30", "01:00", "01:30",
        ],
    },
    {
        "day_id": "sam",
        "day_label": "Samedi",
        "day_date": "19 sept.",
        "iso_date": date(2026, 9, 19),
        "to_hotel": [
            "10:00", "11:00", "11:15", "12:00", "12:15", "13:00", "13:15", "15:15",
            "16:15", "17:15", "18:05", "18:15", "19:00", "20:00", "22:30", "22:45",
            "23:30", "00:00", "00:30", "01:30", "02:00", "03:00", "03:30", "05:00",
            "05:30", "06:30", "07:30", "08:00",
        ],
        "to_palmeraie": [
            "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30",
            "18:30", "19:30", "22:00", "23:00", "23:30", "00:00", "00:30", "01:00",
            "01:30", "02:00", "02:30", "03:00", "04:30",
        ],
    },
    {
        "day_id": "dim",
        "day_label": "Dimanche",
        "day_date": "20 sept.",
        "iso_date": date(2026, 9, 20),
        "to_hotel": [
            "11:00", "11:15", "12:00", "12:15", "13:15", "14:00", "15:15", "16:15",
            "17:15", "18:15", "18:30", "19:15", "21:15", "22:30", "22:45", "23:30",
            "00:30", "02:30", "04:30", "05:00",
        ],
        "to_palmeraie": [
            "10:30", "11:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30",
            "19:30", "22:00", "23:00", "00:00", "01:00",
        ],
    },
]


def seed_shuttles(apps, schema_editor):
    Shuttle = apps.get_model("events", "FestivalShuttleDeparture")
    Shuttle.objects.filter(edition="2026").delete()

    rows = []
    for day in SHUTTLE_DAYS:
        for sort_order, departure_time in enumerate(day["to_hotel"]):
            rows.append(
                Shuttle(
                    edition="2026",
                    day_id=day["day_id"],
                    day_label=day["day_label"],
                    day_date=day["day_date"],
                    iso_date=day["iso_date"],
                    direction="to_hotel",
                    departure_time=departure_time,
                    sort_order=sort_order,
                )
            )
        for sort_order, departure_time in enumerate(day["to_palmeraie"]):
            rows.append(
                Shuttle(
                    edition="2026",
                    day_id=day["day_id"],
                    day_label=day["day_label"],
                    day_date=day["day_date"],
                    iso_date=day["iso_date"],
                    direction="to_palmeraie",
                    departure_time=departure_time,
                    sort_order=sort_order,
                )
            )

    Shuttle.objects.bulk_create(rows)


def unseed_shuttles(apps, schema_editor):
    Shuttle = apps.get_model("events", "FestivalShuttleDeparture")
    Shuttle.objects.filter(edition="2026").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0003_festival_shuttle_departures"),
    ]

    operations = [
        migrations.RunPython(seed_shuttles, unseed_shuttles),
    ]
