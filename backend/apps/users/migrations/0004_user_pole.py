# Generated manually: add pole FK to User (staff/admin)

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0003_add_pole_model"),
        ("users", "0003_user_account_status_user_staff_role_user_user_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="pole",
            field=models.ForeignKey(
                blank=True,
                help_text="Pôle d'appartenance pour les comptes Staff et Admin. Le nombre de membres par pôle est calculé automatiquement.",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="members",
                to="organization.pole",
                verbose_name="Pôle (Staff / Admin)",
            ),
        ),
    ]
