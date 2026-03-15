# Add missing columns if not present (DB may be in partial state after failed 0002)

from django.db import migrations


def add_columns_if_missing(apps, schema_editor):
    with schema_editor.connection.cursor() as c:
        # subscriptionpass.slug
        c.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'trainings_subscriptionpass' AND column_name = 'slug'
                ) THEN
                    ALTER TABLE trainings_subscriptionpass ADD COLUMN slug VARCHAR(100) NULL;
                    UPDATE trainings_subscriptionpass SET slug = REPLACE(id::text, '-', '') WHERE slug IS NULL;
                    ALTER TABLE trainings_subscriptionpass ALTER COLUMN slug SET NOT NULL;
                    CREATE UNIQUE INDEX IF NOT EXISTS trainings_subscriptionpass_slug_idx ON trainings_subscriptionpass(slug);
                END IF;
            END $$;
        """)
        # trainingsession.instructor_id
        c.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'trainings_trainingsession' AND column_name = 'instructor_id'
                ) THEN
                    ALTER TABLE trainings_trainingsession ADD COLUMN instructor_id INTEGER NULL REFERENCES users_user(id) ON DELETE SET NULL;
                END IF;
            END $$;
        """)


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0002_subscriptionpass_slug_trainingsession_instructor"),
    ]

    operations = [
        migrations.RunPython(add_columns_if_missing, migrations.RunPython.noop),
    ]
