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
            {"name": "Identité COF", "slug": "identite-cof", "url": "/identite-cof/", "order": 1, "children": [
                {"name": "Notre vision", "slug": "identite-vision", "url": "/identite-cof/notre-vision", "order": 1},
                {"name": "Bulletins", "slug": "identite-bulletins", "url": "/identite-cof/bulletins", "order": 2},
            ]},
            {"name": "Événements", "slug": "evenements", "url": "/evenements/", "order": 2, "children": [
                {"name": "Liste & Événements", "slug": "evenements-liste", "url": "/evenements/", "order": 1},
                {"name": "Festivals", "slug": "evenements-festivals", "url": "/evenements/festivals/", "order": 2},
            ]},
            {"name": "Explore", "slug": "explore", "url": "/explore/", "order": 3, "children": [
                {"name": "Expérience 3D", "slug": "explore-3d", "url": "/explore/", "order": 1},
                {"name": "Arbre / Liste", "slug": "explore-liste", "url": "/explore/liste/", "order": 2},
            ]},
            {"name": "Cours", "slug": "cours", "url": "/cours/", "order": 4, "children": [
                {"name": "Liste & Planning", "slug": "cours-planning", "url": "/cours/planning/", "order": 1},
                {"name": "Filtres (Ville, Niveau)", "slug": "cours-filtres", "url": "/cours/filtres/", "order": 2},
                {"name": "Détails des programmes", "slug": "cours-programmes", "url": "/cours/programmes/", "order": 3},
                {"name": "Inscription", "slug": "cours-inscription", "url": "/cours/inscription/", "order": 4},
            ]},
            {"name": "Formations", "slug": "formations", "url": "/formations/", "order": 5, "children": [
                {"name": "Contenu éducatif en ligne", "slug": "formations-contenu", "url": "/formations/contenu/", "order": 1},
                {"name": "Catégories", "slug": "formations-categories", "url": "/formations/categories/", "order": 2},
                {"name": "Vidéothèque", "slug": "formations-videotheque", "url": "/formations/videotheque/", "order": 3},
            ]},
            {"name": "Trainings", "slug": "trainings", "url": "/trainings/", "order": 6, "children": [
                {"name": "Sessions libres", "slug": "trainings-sessions", "url": "/trainings/sessions/", "order": 1},
                {"name": "Organisation adhérents", "slug": "trainings-adherents", "url": "/trainings/adherents/", "order": 2},
            ]},
            {"name": "Autre", "slug": "autre", "url": "#", "order": 11, "children": [
                {"name": "Théorie", "slug": "theorie", "url": "/theorie/", "order": 1},
                {"name": "Care", "slug": "care", "url": "/care/", "order": 2},
                {"name": "Shop", "slug": "shop", "url": "/shop/", "order": 3},
                {"name": "Projets", "slug": "projets", "url": "/projets/", "order": 4},
            ]},
            {"name": "Organisation", "slug": "organisation", "url": "/organisation/", "order": 12, "children": [
                {"name": "Nos artistes", "slug": "artistes-annuaire", "url": "/artistes/", "order": 1},
                {"name": "notre structure", "slug": "orga-structure", "url": "/organisation/structure/", "order": 2},
                {"name": "nos poles", "slug": "orga-poles", "url": "/organisation/poles/", "order": 3},
                {"name": "Notre Staff", "slug": "orga-staff", "url": "/organisation/staff/", "order": 4},
            ]},
            {"name": "Nos partenaires", "slug": "nos-partenaires", "url": "/partenaires/", "order": 13, "children": [
                {"name": "Structures partenaires", "slug": "partenaires-structures", "url": "/partenaires/structures", "order": 1},
                {"name": "Événements des partenaires", "slug": "partenaires-evenements", "url": "/partenaires/evenements", "order": 2},
                {"name": "Cours des partenaires", "slug": "partenaires-cours", "url": "/partenaires/cours", "order": 3},
            ]},
            {"name": "DB", "slug": "db", "url": "http://localhost:8000/admin/", "order": 14, "children": [
                {"name": "Accès au schéma de la base de données", "slug": "db-access", "url": "http://localhost:8000/admin/", "order": 1},
            ]},
            {"name": "Login", "slug": "login", "url": "/login/", "order": 15, "children": []},
        ]
        
        # Reset menu items first to avoid duplication
        MenuItem.objects.all().delete()
        
        for p_data in menu_data:
            children = p_data.pop("children", [])
            parent, _ = MenuItem.objects.get_or_create(
                slug=p_data["slug"], defaults={**p_data, "is_active": True, "parent": None}
            )
            for c_data in children:
                MenuItem.objects.get_or_create(
                    slug=c_data["slug"], parent=parent, defaults={**c_data, "is_active": True}
                )

        self.stdout.write(self.style.SUCCESS(f"  Menu créé avec {len(menu_data)} parents (et enfants)."))
        self.stdout.write(self.style.SUCCESS("Données initiales chargées."))
