"""Ajoute image_url aux annonces + seed Share the app (QR)."""

from django.db import migrations, models
from django.db.models import F


APP_URL = "https://app.capitaloffusion.com"
QR_URL = "https://www.capitaloffusion.com/images/festival/app-share-qr.png"


def seed_share_announcement(apps, schema_editor):
    """
    Crée l’annonce partage app en première position (sort_order=0).
    Inputs: registry Django.
    Outputs: une annonce info publiée avec QR + URL.
    """
    FestivalAnnouncement = apps.get_model("events", "FestivalAnnouncement")
    # Décale les annonces normales existantes pour laisser la place 0.
    FestivalAnnouncement.objects.filter(edition="2026", priority="normal").update(
        sort_order=F("sort_order") + 10
    )
    if FestivalAnnouncement.objects.filter(
        edition="2026",
        link_url=APP_URL,
        image_url=QR_URL,
    ).exists():
        return
    FestivalAnnouncement.objects.create(
        edition="2026",
        kind="info",
        priority="normal",
        is_published=True,
        sort_order=0,
        title="Share the festival app",
        title_en="Share the festival app",
        title_fr="Partage l’app du festival",
        title_es="Comparte la app del festival",
        body="Scan the QR or copy the link so friends can open the PWA on their phone.",
        body_en="Scan the QR or copy the link so friends can open the PWA on their phone.",
        body_fr="Scanne le QR ou copie le lien pour que tes amis ouvrent la PWA sur leur téléphone.",
        body_es="Escanea el QR o copia el enlace para que tus amigos abran la PWA en su teléfono.",
        link_url=APP_URL,
        link_label="Copy link",
        link_label_en="Copy link",
        link_label_fr="Copier le lien",
        link_label_es="Copiar enlace",
        image_url=QR_URL,
        badge_label="",
    )


def unseed_share_announcement(apps, schema_editor):
    """Retire l’annonce Share the app."""
    FestivalAnnouncement = apps.get_model("events", "FestivalAnnouncement")
    FestivalAnnouncement.objects.filter(
        edition="2026",
        link_url=APP_URL,
        image_url=QR_URL,
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0019_hotel_day_socials_slots"),
    ]

    operations = [
        migrations.AddField(
            model_name="festivalannouncement",
            name="image_url",
            field=models.URLField(
                blank=True,
                default="",
                help_text=(
                    "URL absolue d’une image (QR code, affiche…). "
                    "Ex. https://www.capitaloffusion.com/images/festival/app-share-qr.png"
                ),
                max_length=500,
            ),
        ),
        migrations.RunPython(seed_share_announcement, unseed_share_announcement),
    ]
