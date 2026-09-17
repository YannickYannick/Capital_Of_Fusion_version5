"""Remplace PWA par appli/app dans l’annonce Share the app."""

from django.db import migrations

APP_URL = "https://app.capitaloffusion.com"
QR_URL = "https://www.capitaloffusion.com/images/festival/app-share-qr.png"

BODIES = {
    "body": "Scan the QR or copy the link so friends can open the app on their phone.",
    "body_en": "Scan the QR or copy the link so friends can open the app on their phone.",
    "body_fr": "Scanne le QR ou copie le lien pour que tes amis ouvrent l’appli sur leur téléphone.",
    "body_es": "Escanea el QR o copia el enlace para que tus amigos abran la app en su teléfono.",
}

REVERSE = {
    "body": "Scan the QR or copy the link so friends can open the PWA on their phone.",
    "body_en": "Scan the QR or copy the link so friends can open the PWA on their phone.",
    "body_fr": "Scanne le QR ou copie le lien pour que tes amis ouvrent la PWA sur leur téléphone.",
    "body_es": "Escanea el QR o copia el enlace para que tus amigos abran la PWA en su teléfono.",
}


def forwards(apps, schema_editor):
    """Met à jour le body de l’annonce partage app."""
    FestivalAnnouncement = apps.get_model("events", "FestivalAnnouncement")
    FestivalAnnouncement.objects.filter(
        edition="2026",
        link_url=APP_URL,
        image_url=QR_URL,
    ).update(**BODIES)


def backwards(apps, schema_editor):
    """Rétablit le wording PWA."""
    FestivalAnnouncement = apps.get_model("events", "FestivalAnnouncement")
    FestivalAnnouncement.objects.filter(
        edition="2026",
        link_url=APP_URL,
        image_url=QR_URL,
    ).update(**REVERSE)


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0020_announcement_share_app_qr"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
