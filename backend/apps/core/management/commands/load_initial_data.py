"""
Commande : python manage.py load_initial_data
Crée les données initiales : Level, DanceStyle, MenuItem (Accueil, Explore, Cours, Événements, Login).
"""
from django.core.management.base import BaseCommand
from apps.core.models import Level, DanceStyle, MenuItem


class Command(BaseCommand):
    help = "Charge les données initiales (Level, DanceStyle, MenuItem)."

    def handle(self, *args, **options):
        self.stdout.write("Création des Level...")
        levels_data = [
            {"name": "Débutant", "slug": "beginner", "order": 1, "color": "#4CAF50"},
            {"name": "Intermédiaire", "slug": "intermediate", "order": 2, "color": "#2196F3"},
            {"name": "Avancé", "slug": "advanced", "order": 3, "color": "#FF9800"},
            {"name": "Professionnel", "slug": "professional", "order": 4, "color": "#9C27B0"},
        ]
        for d in levels_data:
            Level.objects.get_or_create(slug=d["slug"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"  {len(levels_data)} niveaux."))

        self.stdout.write("Création des DanceStyle...")
        styles_data = [
            {"name": "Bachata", "slug": "bachata", "description": ""},
            {"name": "Salsa", "slug": "salsa", "description": ""},
            {"name": "Kizomba", "slug": "kizomba", "description": ""},
        ]
        for d in styles_data:
            DanceStyle.objects.get_or_create(slug=d["slug"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"  {len(styles_data)} styles."))

        self.stdout.write("Création des MenuItem...")
        menu_data = [
            {"name": "Accueil", "slug": "accueil", "url": "/", "order": 1},
            {"name": "Explore", "slug": "explore", "url": "/explore/", "order": 2},
            {"name": "Cours", "slug": "cours", "url": "/cours/", "order": 3},
            {"name": "Événements", "slug": "evenements", "url": "/evenements/", "order": 4},
            {"name": "Login", "slug": "login", "url": "/login/", "order": 5},
        ]
        for d in menu_data:
            MenuItem.objects.get_or_create(
                slug=d["slug"], parent=None, defaults={**d, "is_active": True}
            )
        self.stdout.write(self.style.SUCCESS(f"  {len(menu_data)} entrées de menu."))
        self.stdout.write(self.style.SUCCESS("Données initiales chargées."))
