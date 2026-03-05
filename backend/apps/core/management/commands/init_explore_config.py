from django.core.management.base import BaseCommand
from apps.core.models import ExplorePreset, SiteConfiguration

class Command(BaseCommand):
    def handle(self, *args, **options):
        preset, _ = ExplorePreset.objects.get_or_create(name="Preset 1", defaults={"global_planet_scale": 2.7, "light_config": {"ambientIntensity": 0.6}})
        config = SiteConfiguration.objects.first() or SiteConfiguration.objects.create(site_name="Fusion")
        config.active_explore_preset = preset
        config.save()
        self.stdout.write("Explore config init done.")
