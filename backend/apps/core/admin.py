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


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "url", "order", "is_active")
    list_editable = ("order", "is_active")
    list_filter = ("parent", "is_active")
