"""
Commence par initialiser la base métier via : python manage.py setup_planets
Puis exécute les données démo : python manage.py load_demo_data
"""
from datetime import timedelta
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.core.models import Level, DanceStyle
from apps.organization.models import OrganizationNode, NodeEvent
from apps.courses.models import Course, Schedule
from apps.events.models import Event, EventPass


class Command(BaseCommand):
    help = "Charge les données démo (cours, événements, NodeEvents) basées sur la hiérarchie existante."

    def handle(self, *args, **options):
        today = timezone.now().date()

        self.stdout.write("Génération de la hiérarchie officielle via setup_planets...")
        call_command("setup_planets")
        
        # Mapping pour la suite du script (cours, events)
        try:
            paris = OrganizationNode.objects.get(slug="bachata-vibe-paris-hebdo")
            lyon = OrganizationNode.objects.get(slug="bachata-vibe-lyon")
        except OrganizationNode.DoesNotExist:
            self.stdout.write(self.style.ERROR("Erreur : Impossible de trouver les planètes nécessaires (Paris/Lyon)."))
            return

        self.stdout.write("Création des NodeEvents...")
        for node, title, start_days in [
            (paris, "Soirée Bachata mensuelle", 14),
            (paris, "Stage weekend débutants", 21),
            (lyon, "Cours découverte", 7),
        ]:
            start = timezone.now() + timedelta(days=start_days)
            NodeEvent.objects.get_or_create(
                node=node,
                title=title,
                defaults={
                    "description": f"Événement démo : {title}.",
                    "start_datetime": start,
                    "end_datetime": start + timedelta(hours=3),
                    "location": "Paris" if node == paris else "Lyon",
                    "is_featured": start_days <= 14,
                },
            )
        self.stdout.write(self.style.SUCCESS("  3 NodeEvents."))

        self.stdout.write("Création des cours...")
        bachata = DanceStyle.objects.get(slug="bachata")
        salsa = DanceStyle.objects.get(slug="salsa")
        beginner = Level.objects.get(slug="beginner")
        intermediate = Level.objects.get(slug="intermediate")
        courses_data = [
            {
                "name": "Bachata Débutant",
                "slug": "bachata-debutant",
                "description": "Découverte de la bachata, pas de base et connexion.",
                "style": bachata,
                "level": beginner,
                "node": paris,
            },
            {
                "name": "Bachata Intermédiaire",
                "slug": "bachata-intermediaire",
                "description": "Perfectionnement et figures.",
                "style": bachata,
                "level": intermediate,
                "node": paris,
            },
            {
                "name": "Salsa Débutant",
                "slug": "salsa-debutant",
                "description": "Introduction à la salsa.",
                "style": salsa,
                "level": beginner,
                "node": lyon,
            },
        ]
        for d in courses_data:
            course, created = Course.objects.get_or_create(
                slug=d["slug"],
                defaults={**d, "is_active": True},
            )
            if created:
                Schedule.objects.get_or_create(
                    course=course,
                    day_of_week=1,
                    defaults={
                        "start_time": "19:00",
                        "end_time": "20:30",
                        "location_name": "Studio Paris" if course.node == paris else "Studio Lyon",
                    },
                )
        self.stdout.write(self.style.SUCCESS(f"  {len(courses_data)} cours + horaires."))

        self.stdout.write("Création des événements...")
        events_data = [
            {
                "name": "Festival Bachata Fusion",
                "slug": "festival-bachata-fusion",
                "type": "FESTIVAL",
                "description": "Week-end festival avec stages et soirées.",
                "start_date": today + timedelta(days=30),
                "end_date": today + timedelta(days=32),
                "location_name": "Paris",
                "node": paris,
            },
            {
                "name": "Soirée Social Bachata",
                "slug": "soiree-social-bachata",
                "type": "PARTY",
                "description": "Soirée dansante mensuelle.",
                "start_date": today + timedelta(days=14),
                "end_date": today + timedelta(days=14),
                "location_name": "Paris",
                "node": paris,
            },
            {
                "name": "Atelier Sensual",
                "slug": "atelier-sensual",
                "type": "WORKSHOP",
                "description": "Stage technique bachata sensual.",
                "start_date": today + timedelta(days=7),
                "end_date": today + timedelta(days=7),
                "location_name": "Lyon",
                "node": lyon,
            },
        ]
        for d in events_data:
            event, created = Event.objects.get_or_create(
                slug=d["slug"],
                defaults=d,
            )
            if created:
                EventPass.objects.get_or_create(
                    event=event,
                    name="Pass standard",
                    defaults={"price": 25, "quantity_available": 50},
                )
        self.stdout.write(self.style.SUCCESS(f"  {len(events_data)} événements + passes."))
        self.stdout.write(self.style.SUCCESS("Données démo chargées."))
