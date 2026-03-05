from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.core.models import DanceProfession

User = get_user_model()

class Command(BaseCommand):
    help = "Crée des artistes de démo pour tester la page Artistes."

    def handle(self, *args, **options):
        prof = DanceProfession.objects.get(slug="professeur")
        dj = DanceProfession.objects.get(slug="dj")

        artists_data = [
            {
                "username": "yannick",
                "first_name": "Yannick",
                "last_name": "Bachata",
                "email": "yannick@example.com",
                "bio": "Professeur passionné de Bachata Sensual.",
                "professions": [prof],
            },
            {
                "username": "dj-vibe",
                "first_name": "DJ",
                "last_name": "Vibe",
                "email": "djvibe@example.com",
                "bio": "Le meilleur mix Bachata de la capitale.",
                "professions": [dj],
            },
            {
                "username": "elena",
                "first_name": "Elena",
                "last_name": "Salsa",
                "email": "elena@example.com",
                "bio": "Etoile montante de la Salsa Lyon.",
                "professions": [prof],
            }
        ]

        for data in artists_data:
            professions = data.pop("professions")
            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={**data, "user_type": "STAFF", "staff_role": "TEACHER"}
            )
            if created:
                user.set_password("password123")
                user.save()
            
            user.professions.set(professions)
            user.save()

        self.stdout.write(self.style.SUCCESS(f"{len(artists_data)} artistes de démo créés."))
