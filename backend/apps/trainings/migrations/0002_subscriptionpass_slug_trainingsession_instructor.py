# Generated manually to add missing columns on existing DB

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def fill_slugs_raw(apps, schema_editor):
    """Remplir slug via SQL brut (la table peut avoir un schéma ancien)."""
    with schema_editor.connection.cursor() as c:
        c.execute("SELECT id FROM trainings_subscriptionpass")
        for (uid,) in c.fetchall():
            slug = str(uid).replace("-", "")[:100] or "pass"
            c.execute(
                'UPDATE trainings_subscriptionpass SET slug = %s WHERE id = %s',
                [slug, uid],
            )


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="subscriptionpass",
            name="slug",
            field=models.SlugField(max_length=100, null=True),
        ),
        migrations.RunPython(fill_slugs_raw, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="subscriptionpass",
            name="slug",
            field=models.SlugField(max_length=100, unique=True),
        ),
        migrations.AddField(
            model_name="trainingsession",
            name="instructor",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="training_sessions",
                to=settings.AUTH_USER_MODEL,
                verbose_name="Instructeur",
            ),
        ),
    ]
