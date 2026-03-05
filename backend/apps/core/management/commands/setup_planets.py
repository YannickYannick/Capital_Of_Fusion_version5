from django.core.management.base import BaseCommand
from apps.organization.models import OrganizationNode

class Command(BaseCommand):
    help = "Initialise la hiérarchie officielle des planètes (noeuds métier de Capital of Fusion)."

    def handle(self, *args, **options):
        self.stdout.write("Création des noeuds d'organisation officiels (setup_planets)...")
        OrganizationNode.objects.all().delete()  # On repart au propre

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
        OrganizationNode.objects.update_or_create(
            slug="bachata-vibe-experience",
            defaults={"name": "Bachata Vibe Experience", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#f472b6", "orbit_radius": 2.0, "planet_scale": 0.4, "orbit_phase": 0, "is_visible_3d": True},
        )
        OrganizationNode.objects.update_or_create(
            slug="bachata-vibe-paris-hebdo",
            defaults={"name": "Bachata Vibe Paris Hebdo", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#db2777", "orbit_radius": 3.0, "planet_scale": 0.4, "orbit_phase": 1.2, "is_visible_3d": True},
        )
        OrganizationNode.objects.update_or_create(
            slug="dominican-vibe",
            defaults={"name": "Dominican Vibe", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#be185d", "orbit_radius": 4.0, "planet_scale": 0.4, "orbit_phase": 2.4, "is_visible_3d": True},
        )
        paris_festival, _ = OrganizationNode.objects.update_or_create(
            slug="paris-bachata-festival",
            defaults={"name": "Paris Bachata Festival", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#9d174d", "orbit_radius": 5.0, "planet_scale": 0.6, "orbit_phase": 3.6, "is_visible_3d": True},
        )
        OrganizationNode.objects.update_or_create(
            slug="bachata-vibe-lyon",
            defaults={"name": "Bachata Vibe Lyon", "parent": bachata_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#06b6d4", "orbit_radius": 6.0, "planet_scale": 0.4, "orbit_phase": 4.8, "is_visible_3d": True},
        )

        # --- ENFANTS PARIS BACHATA FESTIVAL ---
        OrganizationNode.objects.update_or_create(
            slug="jack-n-jill-vibe",
            defaults={"name": "Jack n' Jill Vibe", "parent": paris_festival, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#f87171", "orbit_radius": 1.5, "planet_scale": 0.25, "orbit_phase": 0, "is_visible_3d": True},
        )
        OrganizationNode.objects.update_or_create(
            slug="street-battle",
            defaults={"name": "Street Battle", "parent": paris_festival, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#ef4444", "orbit_radius": 2.5, "planet_scale": 0.25, "orbit_phase": 1.57, "is_visible_3d": True},
        )
        OrganizationNode.objects.update_or_create(
            slug="social-world-cup",
            defaults={"name": "Social World Cup", "parent": paris_festival, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#dc2626", "orbit_radius": 3.5, "planet_scale": 0.25, "orbit_phase": 3.14, "is_visible_3d": True},
        )
        OrganizationNode.objects.update_or_create(
            slug="experience-palmeraie",
            defaults={"name": "Experience Palmeraie", "parent": paris_festival, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#b91c1c", "orbit_radius": 4.5, "planet_scale": 0.25, "orbit_phase": 4.71, "is_visible_3d": True},
        )

        # --- ENFANTS KOMPA & AMAPIANO ---
        OrganizationNode.objects.update_or_create(
            slug="kompa-vibe-paris",
            defaults={"name": "Kompa Vibe Paris", "parent": kompa_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#60a5fa", "orbit_radius": 2.0, "planet_scale": 0.4, "orbit_phase": 0, "is_visible_3d": True},
        )
        OrganizationNode.objects.update_or_create(
            slug="amapiano-vibe-paris",
            defaults={"name": "Amapiano Vibe Paris", "parent": amapiano_vibe, "type": OrganizationNode.NodeType.EVENT, "planet_color": "#fde047", "orbit_radius": 2.0, "planet_scale": 0.4, "orbit_phase": 0, "is_visible_3d": True},
        )

        self.stdout.write(self.style.SUCCESS("Hiérarchie de production des planètes créée avec succès !"))
