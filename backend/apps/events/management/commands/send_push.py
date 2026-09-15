"""
Commande pour envoyer des notifications push.

Usage:
    # Envoyer une notification à tous les appareils
    python manage.py send_push "Titre" "Corps du message"

    # Avec données additionnelles
    python manage.py send_push "Titre" "Corps" --data '{"link": "/passes"}'

    # Filtrer par plateforme
    python manage.py send_push "Titre" "Corps" --platform android

    # Envoyer une annonce existante
    python manage.py send_push --announcement <id>

Sur Railway:
    railway run python manage.py send_push "Titre" "Corps"
"""
import json
from django.core.management.base import BaseCommand
from apps.events.push_service import send_push_to_all, send_announcement_notification
from apps.events.models import FestivalAnnouncement, PushToken


class Command(BaseCommand):
    help = "Envoie une notification push à tous les appareils enregistrés"

    def add_arguments(self, parser):
        parser.add_argument(
            "title",
            nargs="?",
            type=str,
            help="Titre de la notification",
        )
        parser.add_argument(
            "body",
            nargs="?",
            type=str,
            help="Corps de la notification",
        )
        parser.add_argument(
            "--data",
            type=str,
            default=None,
            help='Données JSON additionnelles (ex: \'{"link": "/passes"}\')',
        )
        parser.add_argument(
            "--platform",
            type=str,
            choices=["ios", "android", "web"],
            default=None,
            help="Filtrer par plateforme",
        )
        parser.add_argument(
            "--announcement",
            type=str,
            default=None,
            help="ID d'une annonce festival à envoyer",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Afficher le nombre de destinataires sans envoyer",
        )

    def handle(self, *args, **options):
        # Statistiques
        tokens_qs = PushToken.objects.filter(is_active=True)
        if options["platform"]:
            tokens_qs = tokens_qs.filter(platform=options["platform"])
        token_count = tokens_qs.count()

        self.stdout.write(f"[PUSH] {token_count} appareil(s) enregistre(s)")

        if token_count == 0:
            self.stdout.write(
                self.style.WARNING("Aucun token push enregistre. L'app doit etre ouverte au moins une fois.")
            )
            return

        # Mode dry-run
        if options["dry_run"]:
            self.stdout.write(
                self.style.SUCCESS(f"[DRY RUN] {token_count} notification(s) seraient envoyees")
            )
            return

        # Envoyer une annonce existante
        if options["announcement"]:
            try:
                announcement = FestivalAnnouncement.objects.get(id=options["announcement"])
            except FestivalAnnouncement.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Annonce {options['announcement']} introuvable"))
                return

            self.stdout.write(f"[SEND] Envoi de l'annonce: {announcement.title}")
            stats = send_announcement_notification(announcement)

        else:
            # Notification manuelle
            if not options["title"] or not options["body"]:
                self.stdout.write(
                    self.style.ERROR("Titre et corps requis (ou --announcement <id>)")
                )
                return

            data = None
            if options["data"]:
                try:
                    data = json.loads(options["data"])
                except json.JSONDecodeError:
                    self.stdout.write(self.style.ERROR("JSON invalide pour --data"))
                    return

            self.stdout.write(f"[SEND] Envoi: {options['title']}")
            stats = send_push_to_all(
                title=options["title"],
                body=options["body"],
                data=data,
                platform=options["platform"],
            )

        # Résultat
        self.stdout.write(
            self.style.SUCCESS(
                f"OK Envoyees: {stats['sent']} | FAILED: {stats['failed']}"
            )
        )
