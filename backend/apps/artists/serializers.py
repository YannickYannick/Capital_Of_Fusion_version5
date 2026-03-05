from rest_framework import serializers
from .models import Artist, ArtistBooking, ArtistReview
from apps.core.models import DanceStyle

class DanceStyleSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DanceStyle
        fields = ("id", "name", "slug")

class ArtistSerializer(serializers.ModelSerializer):
    styles = DanceStyleSimpleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Artist
        fields = ("id", "name", "slug", "bio", "photo", "styles", "website", "social_links", "is_visible")

class ArtistBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistBooking
        fields = ("id", "artist", "requester", "event_name", "requested_date", "location", "message", "status", "created_at")
        read_only_fields = ("requester", "status", "created_at")

class ArtistReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistReview
        fields = ("id", "artist", "user", "rating", "comment", "created_at")
        read_only_fields = ("user", "created_at")
