"""
Commande : python manage.py load_demo_data
Crée des données démo : noeuds d'organisation, cours, événements, NodeEvents.
Prérequis : load_initial_data doit avoir été exécuté (Level, DanceStyle).
"""
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.core.models import Level, DanceStyle
from apps.organization.models import OrganizationNode, NodeEvent
from apps.courses.models import Course, Schedule
from apps.events.models import Event, EventPass


class Command(BaseCommand):
    help = "Charge les données démo (noeuds, cours, événements, NodeEvents)."

    def handle(self, *args, **options):
        today = timezone.now().date()

        self.stdout.write("Création des noeuds d'organisation...")
        OrganizationNode.objects.all().delete()  # On nettoie pour recréer proprement la hiérarchie

        # --- RACINE ---
        root, _ = OrganizationNode.objects.update_or_create(
            slug="capital-of-fusion",
            defaults={
                "name": "Capital of Fusion France",
                "type": OrganizationNode.NodeType.ROOT,
                "short_description": "École nationale de danse.",
                "description": "Capital of Fusion rassemble les pôles et les acteurs de la danse.",
                "cta_text": "Découvrir",
                "cta_url": "/explore/",
                "planet_color": "#a855f7", # Violet
                "orbit_radius": 0,
                "planet_scale": 1.2,
                "is_visible_3d": True,
            },
        )

        # --- BRANCHES PRINCIPALES ---
        bachata_vibe, _ = OrganizationNode.objects.update_or_create(
            slug="bachata-vibe",
            defaults={
                "name": "Bachata Vibe", "parent": root, "type": OrganizationNode.NodeType.BRANCH,
                "short_description": "Pôle Bachata.", "planet_color": "#ec4899", "orbit_radius": 5.0,
                "planet_scale": 0.8, "orbit_phase": 0.0, "is_visible_3d": True
            },
        )
        kompa_vibe, _ = OrganizationNode.objects.update_or_create(
            slug="kompa-vibe",
            defaults={
                "name": "Kompa Vibe", "parent": root, "type": OrganizationNode.NodeType.BRANCH,
                "short_description": "Pôle Kompa.", "planet_color": "#3b82f6", "orbit_radius": 5.0,
                "planet_scale": 0.8, "orbit_phase": 2.1, "is_visible_3d": True
            },
        )
        amapiano_vibe, _ = OrganizationNode.objects.update_or_create(
            slug="amapiano-vibe",
            defaults={
                "name": "Amapiano Vibe", "parent": root, "type": OrganizationNode.NodeType.BRANCH,
                "short_description": "Pôle Amapiano.", "planet_color": "#eab308", "orbit_radius": 5.0,
                "planet_scale": 0.8, "orbit_phase": 4.2, "is_visible_3d": True
            },
        )

        # --- ENFANTS BACHATA VIBE ---
        bv_experience, _ = OrganizationNode.objects.update_or_create(
            slug="bachata-vibe-experience",
            defaults={"name": "Bachata Vibe Experience", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#f472b6", "orbit_radius": 2.0, "planet_scale": 0.4, "orbit_phase": 0, "is_visible_3d": True},
        )
        bv_paris, _ = OrganizationNode.objects.update_or_create(
            slug="bachata-vibe-paris-hebdo",
            defaults={"name": "Bachata Vibe Paris Hebdo", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#db2777", "orbit_radius": 3.0, "planet_scale": 0.4, "orbit_phase": 1.2, "is_visible_3d": True},
        )
        dominican_vibe, _ = OrganizationNode.objects.update_or_create(
            slug="dominican-vibe",
            defaults={"name": "Dominican Vibe", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#be185d", "orbit_radius": 4.0, "planet_scale": 0.4, "orbit_phase": 2.4, "is_visible_3d": True},
        )
        paris_festival, _ = OrganizationNode.objects.update_or_create(
            slug="paris-bachata-festival",
            defaults={"name": "Paris Bachata Festival", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#9d174d", "orbit_radius": 5.0, "planet_scale": 0.6, "orbit_phase": 3.6, "is_visible_3d": True},
        )
        bv_lyon, _ = OrganizationNode.objects.update_or_create(
            slug="bachata-vibe-lyon",
            defaults={"name": "Bachata Vibe Lyon", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#06b6d4", "orbit_radius": 6.0, "planet_scale": 0.4, "orbit_phase": 4.8, "is_visible_3d": True},
        )

        # --- ENFANTS PARIS BACHATA FESTIVAL ---
        jack_n_jill, _ = OrganizationNode.objects.update_or_create(
            slug="jack-n-jill-vibe",
            defaults={"name": "Jack n' Jill Vibe", "parent": paris_festival, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#f87171", "orbit_radius": 1.5, "planet_scale": 0.25, "orbit_phase": 0, "is_visible_3d": True},
        )
        street_battle, _ = OrganizationNode.objects.update_or_create(
            slug="street-battle",
            defaults={"name": "Street Battle", "parent": paris_festival, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#ef4444", "orbit_radius": 2.5, "planet_scale": 0.25, "orbit_phase": 1.57, "is_visible_3d": True},
        )
        social_world_cup, _ = OrganizationNode.objects.update_or_create(
            slug="social-world-cup",
            defaults={"name": "Social World Cup", "parent": paris_festival, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#dc2626", "orbit_radius": 3.5, "planet_scale": 0.25, "orbit_phase": 3.14, "is_visible_3d": True},
        )
        experience_palmeraie, _ = OrganizationNode.objects.update_or_create(
            slug="experience-palmeraie",
            defaults={"name": "Experience Palmeraie", "parent": paris_festival, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#b91c1c", "orbit_radius": 4.5, "planet_scale": 0.25, "orbit_phase": 4.71, "is_visible_3d": True},
        )

        # --- ENFANTS KOMPA & AMAPIANO ---
        kompa_paris, _ = OrganizationNode.objects.update_or_create(
            slug="kompa-vibe-paris",
            defaults={"name": "Kompa Vibe Paris", "parent": kompa_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#60a5fa", "orbit_radius": 2.0, "planet_scale": 0.4, "orbit_phase": 0, "is_visible_3d": True},
        )
        amapiano_paris, _ = OrganizationNode.objects.update_or_create(
            slug="amapiano-vibe-paris",
            defaults={"name": "Amapiano Vibe Paris", "parent": amapiano_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#fde047", "orbit_radius": 2.0, "planet_scale": 0.4, "orbit_phase": 0, "is_visible_3d": True},
        )

        self.stdout.write(self.style.SUCCESS("  Hiérarchie complète Capital of Fusion France créée."))
        
        # Mapping pour la suite du script (cours, events)
        paris = bv_paris
        lyon = bv_lyon

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
