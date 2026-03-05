from django.core.management.base import BaseCommand
from apps.organization.models import OrganizationNode

class Command(BaseCommand):
    def handle(self, *args, **options):
        OrganizationNode.objects.filter(slug__in=["capital-of-fusion-france", "bachata-vibe", "kompa-vibe"]).delete()
        france = OrganizationNode.objects.create(slug="capital-of-fusion-france", name="Capital of Fusion France", type=OrganizationNode.NodeType.ROOT, orbit_radius=0, planet_scale=1.5)
        OrganizationNode.objects.create(slug="bachata-vibe", name="Bachata Vibe", parent=france, orbit_radius=15, planet_scale=1.2)
        OrganizationNode.objects.create(slug="kompa-vibe", name="Kompa Vibe", parent=france, orbit_radius=20, planet_scale=1.1)
        self.stdout.write("Setup planets done.")
