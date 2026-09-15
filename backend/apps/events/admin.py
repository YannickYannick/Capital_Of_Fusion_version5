from django.contrib import admin
from .models import (
    Event,
    EventPass,
    FestivalAnnouncement,
    FestivalShuttleDeparture,
    FestivalProgramSlot,
    PushToken,
    Registration,
)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "type", "start_date", "end_date", "node")
    list_filter = ("type", "node")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(EventPass)
class EventPassAdmin(admin.ModelAdmin):
    list_display = ("event", "name", "price", "quantity_available")


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ("user", "event_pass", "registered_at", "is_paid")
    list_filter = ("event_pass", "is_paid")


@admin.register(FestivalShuttleDeparture)
class FestivalShuttleDepartureAdmin(admin.ModelAdmin):
    list_display = ("edition", "day_label", "departure_time", "direction", "iso_date", "sort_order")
    list_filter = ("edition", "day_id", "direction")
    search_fields = ("day_label", "departure_time")


@admin.register(FestivalProgramSlot)
class FestivalProgramSlotAdmin(admin.ModelAdmin):
    list_display = ("edition", "day_label", "start_time", "end_time", "title", "room", "category", "level")
    list_filter = ("edition", "day_id", "room", "category", "level")
    search_fields = ("title", "style", "room")
    ordering = ("iso_date", "sort_order", "start_time")


@admin.register(FestivalAnnouncement)
class FestivalAnnouncementAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "priority",
        "edition",
        "is_published",
        "starts_at",
        "ends_at",
        "sort_order",
    )
    list_filter = ("priority", "edition", "is_published")
    search_fields = ("title", "body")
    ordering = ("-priority", "sort_order", "-created_at")


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ("token_short", "platform", "is_active", "last_used_at", "created_at")
    list_filter = ("platform", "is_active")
    search_fields = ("token",)
    readonly_fields = ("token", "created_at", "updated_at", "last_used_at")
    ordering = ("-last_used_at",)

    @admin.display(description="Token")
    def token_short(self, obj):
        return f"{obj.token[:30]}..." if obj.token else "-"
