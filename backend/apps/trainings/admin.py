from django.contrib import admin
from .models import SubscriptionPass, TrainingSession

@admin.register(SubscriptionPass)
class SubscriptionPassAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'validity_months')
    search_fields = ('name',)

@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = ('get_date', 'theme', 'location', 'available_spots', 'is_active')
    search_fields = ('theme', 'location')
    list_filter = ('is_active', 'date')
    
    def get_date(self, obj):
        return obj.date.strftime('%d/%m/%Y %H:%M')
    get_date.short_description = 'Date'
    get_date.admin_order_field = 'date'
