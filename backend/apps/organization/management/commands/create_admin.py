from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create default admin superuser (admin/admin) if it does not exist"

    def handle(self, *args, **options):
        User = get_user_model()
        username = "admin"
        password = "admin"

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"Superuser '{username}' already exists — skipping."))
            return

        User.objects.create_superuser(username=username, password=password, email="admin@capitaloffusion.fr")
        self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully."))
