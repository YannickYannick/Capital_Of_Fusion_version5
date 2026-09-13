from django.contrib import admin
from .models import Event, EventPass, FestivalShuttleDeparture, FestivalProgramSlot, Registration


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
