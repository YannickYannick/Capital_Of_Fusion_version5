# Generated manually — lien menu « Book your hotel » → page interne.

from django.db import migrations
from django.db.models import Q

TARGET_URL = "/festival/book-your-hotel"


def forwards(apps, schema_editor):
    MenuItem = apps.get_model("core", "MenuItem")
    q = (
        Q(slug__iexact="book-your-hotel")
        | Q(slug__iexact="book-hotel")
        | Q(slug__icontains="book-your-hotel")
        | Q(name__icontains="book your hotel")
        | Q(name_en__icontains="book your hotel")
        | Q(name_es__icontains="book your hotel")
        | Q(name_fr__icontains="book your hotel")
        | (Q(url__icontains="goandance") & Q(name__icontains="hotel"))
    )
    for item in MenuItem.objects.filter(q):
        if item.url != TARGET_URL:
            item.url = TARGET_URL
            item.save(update_fields=["url"])


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0018_fix_danseur_cameraman_profession_names"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
