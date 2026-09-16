"""
Traduit les annonces festival existantes (title / body / link_label) en FR, EN, ES.
"""

from django.db import migrations

# Clé = début de titre actuel (FR ou EN) après strip.
TRANSLATIONS = {
    "Bienvenue": {
        "title_fr": "Bienvenue sur l’app PBVF",
        "body_fr": "Les annonces urgentes s’affichent ici, sur tous les écrans. Tu peux fermer ce bandeau.",
        "link_label_fr": "",
        "title_en": "Welcome to the PBVF app",
        "body_en": "Urgent announcements appear here, on every screen. You can dismiss this banner.",
        "link_label_en": "",
        "title_es": "Bienvenido a la app PBVF",
        "body_es": "Los anuncios urgentes aparecen aquí, en todas las pantallas. Puedes cerrar este aviso.",
        "link_label_es": "",
    },
    "Welcome": {
        "title_fr": "Bienvenue sur l’app PBVF",
        "body_fr": "Les annonces urgentes s’affichent ici, sur tous les écrans. Tu peux fermer ce bandeau.",
        "link_label_fr": "",
        "title_en": "Welcome to the PBVF app",
        "body_en": "Urgent announcements appear here, on every screen. You can dismiss this banner.",
        "link_label_en": "",
        "title_es": "Bienvenido a la app PBVF",
        "body_es": "Los anuncios urgentes aparecen aquí, en todas las pantallas. Puedes cerrar este aviso.",
        "link_label_es": "",
    },
    "Code of Conduct": {
        "title_fr": "Code de conduite",
        "body_fr": "Prends connaissance des règles Capital of Fusion avant le festival. Respecte tout le monde, profite de la vibe !",
        "link_label_fr": "Lire",
        "title_en": "Code of Conduct",
        "body_en": "Please read our Code of Conduct before the festival. Respect everyone, enjoy the vibe!",
        "link_label_en": "Read now",
        "title_es": "Código de conducta",
        "body_es": "Lee nuestro Código de conducta antes del festival. Respeta a todo el mundo y disfruta la vibe.",
        "link_label_es": "Leer ahora",
    },
    "Code de conduite": {
        "title_fr": "Code de conduite",
        "body_fr": "Prends connaissance des règles Capital of Fusion avant le festival.",
        "link_label_fr": "Lire",
        "title_en": "Code of Conduct",
        "body_en": "Please read our Code of Conduct before the festival. Respect everyone, enjoy the vibe!",
        "link_label_en": "Read now",
        "title_es": "Código de conducta",
        "body_es": "Lee las reglas de Capital of Fusion antes del festival.",
        "link_label_es": "Leer",
    },
    "Vérifie": {
        "title_fr": "Vérifie ton pass",
        "body_fr": "Consulte le détail inclus / non inclus de chaque formule avant d’acheter des options.",
        "link_label_fr": "Voir les passes",
        "title_en": "Check your pass",
        "body_en": "See what’s included / not included in each formula before buying extras.",
        "link_label_en": "See the passes",
        "title_es": "Revisa tu pass",
        "body_es": "Consulta lo incluido / no incluido en cada fórmula antes de comprar extras.",
        "link_label_es": "Ver los pases",
    },
    "Check your": {
        "title_fr": "Vérifie ton pass",
        "body_fr": "Consulte le détail inclus / non inclus de chaque formule avant d’acheter des options.",
        "link_label_fr": "Voir les passes",
        "title_en": "Check your pass",
        "body_en": "See what’s included / not included in each formula before buying extras.",
        "link_label_en": "See the passes",
        "title_es": "Revisa tu pass",
        "body_es": "Consulta lo incluido / no incluido en cada fórmula antes de comprar extras.",
        "link_label_es": "Ver los pases",
    },
}


def _match_key(title: str) -> str | None:
    text = (title or "").strip()
    for key in TRANSLATIONS:
        if text.startswith(key):
            return key
    return None


def fill_translations(apps, schema_editor):
    FestivalAnnouncement = apps.get_model("events", "FestivalAnnouncement")
    for row in FestivalAnnouncement.objects.all():
        key = _match_key(row.title) or _match_key(row.title_fr or "") or _match_key(row.title_en or "")
        if not key:
            # Recopie le texte actuel dans les 3 langues pour ne rien laisser vide.
            for lang in ("fr", "en", "es"):
                setattr(row, f"title_{lang}", row.title or "")
                setattr(row, f"body_{lang}", row.body or "")
                setattr(row, f"link_label_{lang}", row.link_label or "")
            row.save(update_fields=[
                "title_fr", "title_en", "title_es",
                "body_fr", "body_en", "body_es",
                "link_label_fr", "link_label_en", "link_label_es",
            ])
            continue

        payload = TRANSLATIONS[key]
        for field, value in payload.items():
            setattr(row, field, value)
        row.title = payload["title_fr"]
        row.body = payload["body_fr"]
        row.link_label = payload["link_label_fr"]
        row.save()


def noop(apps, schema_editor):
    return None


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0012_festival_announcement_i18n"),
    ]

    operations = [
        migrations.RunPython(fill_translations, noop),
    ]
