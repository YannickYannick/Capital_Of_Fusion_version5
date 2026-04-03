from django.apps import AppConfig


class OrganizationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.organization"
    verbose_name = "Organisation"

    def ready(self):
        # Enregistre les signaux d'invalidation du cache
        import apps.organization.signals  # noqa: F401
