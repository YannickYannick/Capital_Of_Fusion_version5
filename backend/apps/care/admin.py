from django.contrib import admin
from .models import Practitioner, CareService

@admin.register(Practitioner)
class PractitionerAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialty', 'created_at')
    search_fields = ('name', 'specialty')
    list_filter = ('specialty',)

@admin.register(CareService)
class CareServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'practitioner', 'duration_minutes', 'price', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('practitioner',)
