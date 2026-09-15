"""
Migration de données : mise à jour lineup artistes festival.
- Supprime : alexis-sania, michael-dori
- Ajoute : lina, dj-loves-me, diger-marie
"""
from django.db import migrations


def update_artists(apps, schema_editor):
    User = apps.get_model("users", "User")
    DanceProfession = apps.get_model("core", "DanceProfession")

    # ─── Récupérer ou créer les professions ───────────────────────────────────
    danseur, _ = DanceProfession.objects.get_or_create(
        slug="danseur",
        defaults={"name": "Danseur"}
    )
    professeur, _ = DanceProfession.objects.get_or_create(
        slug="professeur",
        defaults={"name": "Professeur"}
    )
    dj, _ = DanceProfession.objects.get_or_create(
        slug="dj",
        defaults={"name": "DJ"}
    )

    # ─── Supprimer les artistes ───────────────────────────────────────────────
    User.objects.filter(username__in=["alexis-sania", "michael-dori"]).delete()

    # ─── Ajouter les nouveaux artistes ────────────────────────────────────────
    new_artists = [
        {
            "username": "lina",
            "first_name": "Lina",
            "professions": [danseur, professeur],
            "external_links": {},
        },
        {
            "username": "dj-loves-me",
            "first_name": "DJ Loves Me",
            "professions": [dj],
            "external_links": {"websites": ["http://djloves.me/"]},
        },
        {
            "username": "diger-marie",
            "first_name": "Diger & Marie",
            "professions": [danseur, professeur],
            "external_links": {},
        },
    ]

    for artist_data in new_artists:
        profs = artist_data.pop("professions")
        # Évite les doublons si la migration est rejouée
        user, created = User.objects.get_or_create(
            username=artist_data["username"],
            defaults={
                **artist_data,
                "staff_role": "ARTIST",
                "user_type": "STAFF",
                "account_status": "APPROVED",
                "artist_display_order": 1,
                "is_active": True,
            }
        )
        if created:
            user.professions.set(profs)


def reverse_update(apps, schema_editor):
    """Rollback : supprime les nouveaux, ne restaure pas les anciens."""
    User = apps.get_model("users", "User")
    User.objects.filter(username__in=["lina", "dj-loves-me", "diger-marie"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0009_user_artist_display_order"),
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(update_artists, reverse_update),
    ]
