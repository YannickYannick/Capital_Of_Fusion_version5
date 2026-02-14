from django.contrib import admin
from .models import Event, EventPass, Registration


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
