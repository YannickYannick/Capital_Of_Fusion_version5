# Biographie artiste — type de demande en attente

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0010_bulletin_content_markdown_en_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="pendingcontentedit",
            name="content_type",
            field=models.CharField(
                max_length=32,
                choices=[
                    ("siteconfig", "Configuration (Notre vision)"),
                    ("bulletin", "Bulletin"),
                    ("user_artist_bio", "Biographie artiste"),
                    ("event", "Événement"),
                    ("course", "Cours"),
                    ("theory_lesson", "Leçon de théorie"),
                    ("organization_node", "Noeud organisation"),
                    ("project", "Projet"),
                ],
            ),
        ),
    ]
