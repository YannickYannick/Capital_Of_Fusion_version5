from django.contrib import admin
from .models import Artist, ArtistBooking, ArtistReview

@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_visible', 'created_at')
    list_filter = ('is_visible', 'styles')
    search_fields = ('name', 'bio', 'user__email', 'user__username')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ['user', 'styles']

@admin.register(ArtistBooking)
class ArtistBookingAdmin(admin.ModelAdmin):
    list_display = ('artist', 'event_name', 'requester', 'status', 'requested_date', 'created_at')
    list_filter = ('status', 'artist')
    search_fields = ('artist__name', 'event_name', 'requester__email')

@admin.register(ArtistReview)
class ArtistReviewAdmin(admin.ModelAdmin):
    list_display = ('artist', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'artist')
    search_fields = ('artist__name', 'user__email')
