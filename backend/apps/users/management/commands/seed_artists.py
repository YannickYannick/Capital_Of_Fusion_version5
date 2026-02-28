from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.core.models import DanceProfession, Level

User = get_user_model()

class Command(BaseCommand):
    help = "Crée des artistes de démonstration (professeurs, DJs)."

    def handle(self, *args, **options):
        self.stdout.write("Création des professions...")
        professions_data = [
            {"name": "Professeur", "slug": "professeur"},
            {"name": "DJ", "slug": "dj"},
            {"name": "Organisateur", "slug": "organisateur"},
            {"name": "Photographe", "slug": "photographe"},
        ]
        professions = {}
        for d in professions_data:
            p, _ = DanceProfession.objects.get_or_create(slug=d["slug"], defaults=d)
            professions[d["slug"]] = p
            
        self.stdout.write("Création des artistes...")
        beginner = Level.objects.get(slug="beginner")
        intermediate = Level.objects.get(slug="intermediate")
        advanced = Level.objects.get(slug="advanced")
        pro = Level.objects.get(slug="professional")

        artists_data = [
            {
                "username": "yannick",
                "first_name": "Yannick",
                "last_name": "Vibe",
                "email": "yannick@bachatavibe.fr",
                "bio": "Fondateur de BachataVibe, professeur international de Bachata Fusion.",
                "is_vibe": True,
                "dance_level": pro,
                "prof_slugs": ["professeur", "organisateur"]
            },
            {
                "username": "chloe",
                "first_name": "Chloé",
                "last_name": "Dance",
                "email": "chloe@example.com",
                "bio": "Spécialiste Bachata Sensual et Lady Styling.",
                "is_vibe": True,
                "dance_level": advanced,
                "prof_slugs": ["professeur"]
            },
            {
                "username": "dj_fusion",
                "first_name": "Marc",
                "last_name": "DJ",
                "email": "marc@dj.com",
                "bio": "DJ officiel des soirées Capital of Fusion.",
                "is_vibe": False,
                "dance_level": intermediate,
                "prof_slugs": ["dj"]
            },
        ]

        for d in artists_data:
            prof_slugs = d.pop("prof_slugs")
            user, created = User.objects.get_or_create(
                username=d["username"],
                defaults={
                    "first_name": d["first_name"],
                    "last_name": d["last_name"],
                    "email": d["email"],
                    "bio": d["bio"],
                    "is_vibe": d["is_vibe"],
                    "dance_level": d["dance_level"],
                }
            )
            if created:
                user.set_password("demo123")
                user.save()
            
            # Ajouter les professions
            for slug in prof_slugs:
                user.professions.add(professions[slug])
                
        self.stdout.write(self.style.SUCCESS(f"  {len(artists_data)} artistes créés."))
