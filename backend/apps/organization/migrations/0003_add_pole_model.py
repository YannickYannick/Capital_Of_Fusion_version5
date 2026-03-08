# Generated manually for Pole model

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0002_teammember_organizationnode_orbit_position_y_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="Pole",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255, verbose_name="Nom du pôle")),
                (
                    "slug",
                    models.SlugField(max_length=255, unique=True),
                ),
                (
                    "order",
                    models.PositiveSmallIntegerField(
                        default=0,
                        help_text="Plus le nombre est petit, plus le pôle apparaît en haut dans les listes.",
                        verbose_name="Ordre d'affichage",
                    ),
                ),
            ],
            options={
                "verbose_name": "Pôle",
                "verbose_name_plural": "Pôles",
                "ordering": ["order", "name"],
            },
        ),
    ]
