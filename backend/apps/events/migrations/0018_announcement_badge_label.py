"""Libellé de badge configurable pour le bandeau urgent."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0017_replace_luis_andrea_slots"),
    ]

    operations = [
        migrations.AddField(
            model_name="festivalannouncement",
            name="badge_label",
            field=models.CharField(
                blank=True,
                default="",
                help_text=(
                    "Mot affiché à gauche du bandeau (urgence). "
                    "Ex. URGENT, TEST, INFO. Vide = URGENT par défaut dans l’app."
                ),
                max_length=32,
            ),
        ),
    ]
