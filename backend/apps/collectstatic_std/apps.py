from django.apps import AppConfig


class CollectstaticStdConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.collectstatic_std"
    verbose_name = "Collectstatic Django standard (contourne cloudinary_storage)"
