from django.contrib import admin
from .models import Partner, PartnerNode, PartnerEvent, PartnerCourse, PartnerSchedule


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(PartnerNode)
class PartnerNodeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "type", "partner", "parent")
    list_filter = ("type", "partner")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "short_description")
    raw_id_fields = ("parent", "partner")
    filter_horizontal = ("linked_artists",)


@admin.register(PartnerEvent)
class PartnerEventAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "type", "start_date", "end_date", "partner", "node")
    list_filter = ("type", "partner")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)
    raw_id_fields = ("partner", "node")


@admin.register(PartnerCourse)
class PartnerCourseAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "style", "level", "is_active", "partner", "node")
    list_filter = ("is_active", "style", "level", "partner")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)
    raw_id_fields = ("partner", "node")
    filter_horizontal = ("teachers",)


@admin.register(PartnerSchedule)
class PartnerScheduleAdmin(admin.ModelAdmin):
    list_display = ("course", "day_of_week", "start_time", "end_time", "location_name")
    list_filter = ("day_of_week",)
