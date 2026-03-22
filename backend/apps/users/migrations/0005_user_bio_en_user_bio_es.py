# Generated manually for multilingual artist bios

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_user_pole"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="bio_en",
            field=models.TextField(blank=True, verbose_name="Biographie (anglais)"),
        ),
        migrations.AddField(
            model_name="user",
            name="bio_es",
            field=models.TextField(blank=True, verbose_name="Biographie (espagnol)"),
        ),
        migrations.AlterField(
            model_name="user",
            name="bio",
            field=models.TextField(blank=True, verbose_name="Biographie (français)"),
        ),
    ]
