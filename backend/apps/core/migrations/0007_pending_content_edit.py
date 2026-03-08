# Generated manually for PendingContentEdit (staff approval workflow)

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_identite_cof_vision_bulletins"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PendingContentEdit",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content_type", models.CharField(
                    choices=[
                        ("siteconfig", "Configuration (Notre vision)"),
                        ("bulletin", "Bulletin"),
                        ("event", "Événement"),
                        ("course", "Cours"),
                        ("theory_lesson", "Leçon de théorie"),
                        ("organization_node", "Noeud organisation"),
                        ("project", "Projet"),
                    ],
                    max_length=32,
                )),
                ("object_id", models.CharField(blank=True, help_text="Slug ou id de l'objet (vide pour siteconfig)", max_length=255)),
                ("payload", models.JSONField(default=dict, help_text="Champs proposés (partial update)")),
                ("status", models.CharField(
                    choices=[("PENDING", "En attente"), ("APPROVED", "Approuvé"), ("REJECTED", "Refusé")],
                    default="PENDING",
                    max_length=10,
                )),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("requested_by", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="pending_content_edits",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("reviewed_by", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="reviewed_content_edits",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "verbose_name": "Modification en attente",
                "verbose_name_plural": "Modifications en attente",
                "ordering": ["-created_at"],
            },
        ),
    ]
