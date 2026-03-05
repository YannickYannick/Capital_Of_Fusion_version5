from django.core.management.base import BaseCommand
from apps.organization.models import OrganizationNode
from apps.core.models import Level, DanceStyle, DanceProfession

class Command(BaseCommand):
    help = "Initialise la hiérarchie des planètes (OrganizationNodes) et les données de base (Styles, Niveaux)."

    def handle(self, *args, **options):
        # 1. Styles de danse
        bachata, _ = DanceStyle.objects.get_or_create(slug="bachata", defaults={"name": "Bachata"})
        salsa, _ = DanceStyle.objects.get_or_create(slug="salsa", defaults={"name": "Salsa"})
        kizomba, _ = DanceStyle.objects.get_or_create(slug="kizomba", defaults={"name": "Kizomba"})

        # 2. Niveaux
        Level.objects.get_or_create(slug="beginner", defaults={"name": "Débutant", "order": 1})
        Level.objects.get_or_create(slug="intermediate", defaults={"name": "Intermédiaire", "order": 2})
        Level.objects.get_or_create(slug="advanced", defaults={"name": "Avancé", "order": 3})

        # 3. Métiers
        prof, _ = DanceProfession.objects.get_or_create(slug="professeur", defaults={"name": "Professeur"})
        dj, _ = DanceProfession.objects.get_or_create(slug="dj", defaults={"name": "DJ"})
        DanceProfession.objects.get_or_create(slug="organisateur", defaults={"name": "Organisateur"})

        # 4. Planètes (OrganizationNodes)
        # Paris
        paris, _ = OrganizationNode.objects.get_or_create(
            slug="bachata-vibe-paris-hebdo",
            defaults={
                "name": "Bachata Vibe Paris",
                "short_description": "L'épicentre de la bachata à Paris.",
                "is_visible_3d": True,
            }
        )

        # Lyon
        lyon, _ = OrganizationNode.objects.get_or_create(
            slug="bachata-vibe-lyon",
            defaults={
                "name": "Bachata Vibe Lyon",
                "short_description": "La fusion lyonnaise.",
                "is_visible_3d": True,
            }
        )

        self.stdout.write(self.style.SUCCESS("Hiérarchie des planètes et données de base initialisées."))
