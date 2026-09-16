"""Classe les annonces existantes dans les 4 types."""

from django.db import migrations


def classify_kinds(apps, schema_editor):
    FestivalAnnouncement = apps.get_model("events", "FestivalAnnouncement")
    for row in FestivalAnnouncement.objects.all():
        link = (row.link_url or "").strip()
        if row.priority == "urgent":
            row.kind = "urgent"
        elif link:
            row.kind = "link"
        else:
            row.kind = "info"
        row.save(update_fields=["kind"])


def noop(apps, schema_editor):
    return None


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0014_announcement_kind"),
    ]

    operations = [
        migrations.RunPython(classify_kinds, noop),
    ]
