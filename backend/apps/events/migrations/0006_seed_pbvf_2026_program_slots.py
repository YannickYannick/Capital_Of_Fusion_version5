"""Seed planning PBVF 2026 depuis affiches officielles (notre-programme)."""

from django.db import migrations

from apps.events.program_seed_pbvf_2026 import DAYS, SLOT_ROWS


def seed_program(apps, schema_editor):
    Slot = apps.get_model("events", "FestivalProgramSlot")
    Slot.objects.filter(edition="2026").delete()

    day_meta = {d["id"]: d for d in DAYS}
    rows = []
    order = 0
    for row in SLOT_ROWS:
        day_id, room, start, end, title, style, level, category, is_live, not_in_pass = row
        meta = day_meta[day_id]
        rows.append(
            Slot(
                edition="2026",
                day_id=day_id,
                day_label=meta["label"],
                day_date=meta["date"],
                iso_date=meta["iso_date"],
                room=room,
                start_time=start,
                end_time=end,
                title=title,
                style=style,
                level=level,
                category=category,
                is_live=is_live,
                not_in_full_pass=not_in_pass,
                sort_order=order,
            )
        )
        order += 1
    Slot.objects.bulk_create(rows)


def unseed_program(apps, schema_editor):
    Slot = apps.get_model("events", "FestivalProgramSlot")
    Slot.objects.filter(edition="2026").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0005_festival_program_slots"),
    ]

    operations = [
        migrations.RunPython(seed_program, unseed_program),
    ]
