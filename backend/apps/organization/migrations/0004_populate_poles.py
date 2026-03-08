# Data migration: create the 11 initial poles

from django.db import migrations


POLES = [
    (1, "Bachata vibe Lyon", "bachata-vibe-lyon"),
    (2, "Discussion (Orga)", "discussion-orga"),
    (3, "TEAM ORGA ( DOMINICAN VIBE", "team-orga-dominican-vibe"),
    (4, "TEAM ORGA (Direction)", "team-orga-direction"),
    (5, "TEAM ORGA (Jack&Jill)", "team-orga-jack-jill"),
    (6, "TEAM ORGA (Opérationnel)", "team-orga-operationnel"),
    (7, "TEAM VIBE (Bénévoles)", "team-vibe-benevoles"),
    (8, "TEAM VIBE (INCUBATION)", "team-vibe-incubation"),
    (9, "TEAM VIBE (PROF)", "team-vibe-prof"),
    (10, "TEAM VIBE (Référent)", "team-vibe-referent"),
    (11, "TEAM VIBE (Superviseur)", "team-vibe-superviseur"),
]


def create_poles(apps, schema_editor):
    Pole = apps.get_model("organization", "Pole")
    for order, name, slug in POLES:
        Pole.objects.get_or_create(slug=slug, defaults={"name": name, "order": order})


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0003_add_pole_model"),
    ]

    operations = [
        migrations.RunPython(create_poles, noop),
    ]
