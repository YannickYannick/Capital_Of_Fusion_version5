# Created manually: ensure shop_category table exists (partial DB state)

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("shop", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS shop_category (
                id UUID NOT NULL PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL UNIQUE,
                description TEXT NOT NULL DEFAULT '',
                icon VARCHAR(50) NOT NULL DEFAULT '',
                image VARCHAR(100) NULL,
                "order" INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT true
            );
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
