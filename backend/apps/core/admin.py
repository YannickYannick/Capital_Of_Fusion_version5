from django.contrib import admin
from .models import DanceStyle, Level, DanceProfession, SiteConfiguration, MenuItem, ExplorePreset, Bulletin


@admin.register(DanceStyle)
class DanceStyleAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent")
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ("parent",)
    search_fields = ("name",)


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order", "color")
    list_editable = ("order",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(DanceProfession)
class DanceProfessionAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ExplorePreset)
class ExplorePresetAdmin(admin.ModelAdmin):
    list_display = ("name", "global_planet_scale", "global_orbit_speed", "vertical_mode")

@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = ("site_name", "hero_title", "updated_at")
    fieldsets = (
        ("Général", {"fields": ("site_name", "hero_title", "hero_subtitle")}),
        ("Identité COF — Notre vision", {"fields": ("vision_markdown",)}),
        ("Explore 3D", {"fields": ("active_explore_preset",)}),
        ("Vidéo Accueil", {"fields": ("main_video_type", "main_video_youtube_id", "main_video_file")}),
        ("Vidéo Cycle", {"fields": ("cycle_video_type", "cycle_video_youtube_id", "cycle_video_file")}),
    )


@admin.register(Bulletin)
class BulletinAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "published_at", "is_published")
    list_filter = ("is_published",)
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title",)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "url", "order", "is_active")
    list_editable = ("order", "is_active")
    list_filter = ("parent", "is_active")
