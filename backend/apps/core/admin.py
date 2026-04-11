from django.contrib import admin
from .models import (
    DanceStyle,
    Level,
    DanceProfession,
    SiteConfiguration,
    SiteVideoAmbience,
    MenuItem,
    ExplorePreset,
    Bulletin,
    PendingContentEdit,
)


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
    list_display = ("name", "global_planet_scale", "global_orbit_speed", "vertical_mode", "show_orbit_zone_indicator")
    fieldsets = (
        (
            "Zone de ralentissement (cercle au survol)",
            {
                "fields": ("show_orbit_zone_indicator", "orbit_zone_indicator_color", "orbit_zone_indicator_opacity"),
                "description": "Cercle affiché quand la souris est dans la zone où les planètes ralentissent. Visible en haut du formulaire pour réglage rapide.",
            },
        ),
        (
            "Général",
            {"fields": ("name", "show_orbits", "freeze_planets", "show_debug_info", "fish_eye", "light_config")},
        ),
        (
            "Orbites",
            {
                "fields": (
                    "orbit_spacing",
                    "global_planet_scale",
                    "global_shape_override",
                    "orbit_shape",
                    "orbit_roundness",
                )
            },
        ),
        (
            "Physique / Forces",
            {"fields": ("mouse_force", "collision_force", "damping", "return_force")},
        ),
        (
            "Entrée (cinématique)",
            {
                "fields": (
                    "entry_stagger",
                    "entry_start_x",
                    "entry_start_y",
                    "entry_start_z",
                    "entry_speed_start",
                    "entry_speed_end",
                    "entry_easing",
                    "entry_duration",
                    "entry_trajectory",
                    "fan_distance",
                )
            },
        ),
        (
            "Orbite (vitesse)",
            {
                "fields": (
                    "orbit_speed_start",
                    "orbit_speed_target",
                    "orbit_easing",
                    "orbital_ramp_duration",
                    "global_orbit_speed",
                )
            },
        ),
        (
            "Vidéo",
            {
                "fields": (
                    "grayscale_video",
                    "enable_video_cycle",
                    "video_cycle_visible",
                    "video_cycle_hidden",
                    "video_transition",
                    "show_video_overlay",
                    "show_entry_trajectory",
                )
            },
        ),
        (
            "Mode vertical",
            {
                "fields": (
                    "vertical_mode",
                    "auto_distribute_orbits",
                    "vertical_homogeneous_base",
                    "vertical_homogeneous_step",
                    "vertical_jupiter_amplitude",
                    "vertical_sphere_radius",
                )
            },
        ),
        (
            "Survol (hover)",
            {
                "fields": (
                    "hover_orbit_speed_ratio",
                    "hover_planet_speed_ratio",
                    "hover_orbit_transition_speed",
                    "hover_planet_transition_speed",
                )
            },
        ),
        (
            "Divers",
            {"fields": ("is_transitioning_to_explore", "auto_reset_camera", "auto_reset_delay")},
        ),
        (
            "Caméra (position par défaut)",
            {"fields": ("camera_x", "camera_y", "camera_z", "camera_target_x", "camera_target_y", "camera_target_z")},
        ),
        (
            "Oscillation (planète sélectionnée)",
            {"fields": ("oscillation_amplitude", "oscillation_frequency")},
        ),
    )

@admin.register(SiteVideoAmbience)
class SiteVideoAmbienceAdmin(admin.ModelAdmin):
    """Singleton : une seule entrée pour tout le site."""

    list_display = (
        "__str__",
        "background_music_mode",
        "default_youtube_quality",
        "use_black_background",
        "disable_youtube_iframes",
        "updated_at",
    )

    fieldsets = (
        (
            "Vidéo de fond",
            {
                "fields": (
                    "grayscale_video",
                    "show_video_overlay",
                    "use_black_background",
                    "disable_youtube_iframes",
                    "default_youtube_quality",
                ),
                "description": "Ces réglages s’appliquent à tous les visiteurs. Les boutons équivalents dans le site ne sont visibles que pour les comptes admin.",
            },
        ),
        (
            "Texte & musique",
            {
                "fields": (
                    "enable_text_shadow",
                    "background_music_mode",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        return not SiteVideoAmbience.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = ("site_name", "hero_title", "updated_at")
    fieldsets = (
        ("Général", {"fields": ("site_name", "hero_title", "hero_subtitle")}),
        ("Identité COF — Notre vision", {"fields": ("vision_markdown",)}),
        ("Identité COF — Notre histoire", {"fields": ("history_markdown",)}),
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


@admin.register(PendingContentEdit)
class PendingContentEditAdmin(admin.ModelAdmin):
    list_display = ("id", "content_type", "object_id", "status", "requested_by", "created_at")
    list_filter = ("status", "content_type")
    search_fields = ("object_id", "requested_by__username")
    readonly_fields = ("requested_by", "created_at", "updated_at")
