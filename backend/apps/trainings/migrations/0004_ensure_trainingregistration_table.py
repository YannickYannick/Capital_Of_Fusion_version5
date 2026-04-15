"""
Répare une BDD où les migrations trainings sont appliquées mais la table
trainings_trainingregistration n'existe pas (ex. migration interrompue, copie partielle).
Sans cette table, l'admin User peut lever ProgrammingError (reverse FK training_registrations).
"""

from django.db import migrations


def ensure_trainingregistration_table(apps, schema_editor):
    connection = schema_editor.connection
    table = "trainings_trainingregistration"
    with connection.cursor() as cursor:
        existing = set(connection.introspection.table_names(cursor))
    if table in existing:
        return
    TrainingRegistration = apps.get_model("trainings", "TrainingRegistration")
    schema_editor.create_model(TrainingRegistration)


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0003_add_missing_columns_sql"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[],
            database_operations=[
                migrations.RunPython(ensure_trainingregistration_table, migrations.RunPython.noop),
            ],
        ),
    ]
