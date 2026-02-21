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
            {"name": "Accueil", "slug": "accueil", "url": "/", "order": 1, "children": []},
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
            {"name": "Artistes", "slug": "artistes", "url": "/artistes/", "order": 7, "children": [
                {"name": "Annuaire", "slug": "artistes-annuaire", "url": "/artistes/annuaire/", "order": 1},
                {"name": "Profils & Bios", "slug": "artistes-profils", "url": "/artistes/profils/", "order": 2},
                {"name": "Booking", "slug": "artistes-booking", "url": "/artistes/booking/", "order": 3},
                {"name": "Avis & Notes", "slug": "artistes-avis", "url": "/artistes/avis/", "order": 4},
            ]},
            {"name": "Théorie", "slug": "theorie", "url": "/theorie/", "order": 8, "children": [
                {"name": "Cours théoriques", "slug": "theorie-cours", "url": "/theorie/cours/", "order": 1},
                {"name": "Quiz de connaissances", "slug": "theorie-quiz", "url": "/theorie/quiz/", "order": 2},
                {"name": "Suivi de progression", "slug": "theorie-progression", "url": "/theorie/progression/", "order": 3},
            ]},
            {"name": "Care", "slug": "care", "url": "/care/", "order": 9, "children": [
                {"name": "Soins & Récupération", "slug": "care-soins", "url": "/care/soins/", "order": 1},
                {"name": "Nos Praticiens", "slug": "care-praticiens", "url": "/care/praticiens/", "order": 2},
                {"name": "Réservation", "slug": "care-reservation", "url": "/care/reservation/", "order": 3},
            ]},
            {"name": "Shop", "slug": "shop", "url": "/shop/", "order": 10, "children": [
                {"name": "Pulls & Sweats", "slug": "shop-pulls", "url": "/shop/pulls/", "order": 1},
                {"name": "T-shirts", "slug": "shop-tshirts", "url": "/shop/tshirts/", "order": 2},
                {"name": "Chaussures", "slug": "shop-chaussures", "url": "/shop/chaussures/", "order": 3},
                {"name": "Vins & Spiritueux", "slug": "shop-vins", "url": "/shop/vins/", "order": 4},
            ]},
            {"name": "Projets", "slug": "projets", "url": "/projets/", "order": 11, "children": [
                {"name": "Programme d'incubation", "slug": "projets-incubation", "url": "/projets/incubation/", "order": 1},
                {"name": "Autres initiatives", "slug": "projets-initiatives", "url": "/projets/initiatives/", "order": 2},
            ]},
            {"name": "Organisation", "slug": "organisation", "url": "/organisation/", "order": 12, "children": [
                {"name": "Structure", "slug": "orga-structure", "url": "/organisation/structure/", "order": 1},
                {"name": "Pôles", "slug": "orga-poles", "url": "/organisation/poles/", "order": 2},
            ]},
            {"name": "DB", "slug": "db", "url": "http://localhost:8000/admin/", "order": 13, "children": [
                {"name": "Accès au schéma de la base de données", "slug": "db-access", "url": "http://localhost:8000/admin/", "order": 1},
            ]},
            {"name": "Login", "slug": "login", "url": "/login/", "order": 14, "children": []},
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
