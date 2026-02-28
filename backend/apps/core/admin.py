from django.contrib import admin
from .models import DanceStyle, Level, DanceProfession, SiteConfiguration, MenuItem


@admin.register(DanceStyle)
class DanceStyleAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent")
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ("parent",)


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order", "color")
    list_editable = ("order",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(DanceProfession)
class DanceProfessionAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = ("site_name", "hero_title", "updated_at")
    
    fieldsets = (
        ("Informations Générales", {
            "fields": ("site_name", "hero_title", "hero_subtitle")
        }),
        ("Vidéo Principale (Accueil)", {
            "fields": ("main_video_type", "main_video_youtube_id", "main_video_file"),
            "description": "Choisissez YouTube pour une vidéo hébergée ou MP4 pour une vidéo native en 1080p/4K."
        }),
        ("Vidéo Cyclique (Apparition aléatoire)", {
            "fields": ("cycle_video_type", "cycle_video_youtube_id", "cycle_video_file"),
            "description": "Vidéo secondaire qui apparaît de temps en temps par-dessus."
        }),
    )


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "url", "order", "is_active")
    list_editable = ("order", "is_active")
    list_filter = ("parent", "is_active")
