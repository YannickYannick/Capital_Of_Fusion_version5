import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.core.models import SiteConfiguration

def setup_videos():
    config, created = SiteConfiguration.objects.get_or_create(id=1)
    
    # Configuration Vidéo Principale
    config.main_video_type = 'mp4'
    config.main_video_file.name = 'videos/background-main.mp4'
    
    # Configuration Vidéo Cyclique
    config.cycle_video_type = 'youtube'
    # Pour l'instant, on laisse la vidéo cyclique en youtube par défaut ou on la met en mp4 (l'utilisateur pourra changer via l'admin)
    config.cycle_video_file.name = 'videos/background-cycle.mp4'
    
    config.save()
    print("Configuration vidéo mise à jour avec succès :")
    print(f"- Main: {config.main_video_type} -> {config.main_video_file.name}")
    print(f"- Cycle: {config.cycle_video_type} -> {config.cycle_video_file.name}")

if __name__ == "__main__":
    setup_videos()
