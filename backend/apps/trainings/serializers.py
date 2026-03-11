"""
Serializers Trainings — Pass d'abonnement et sessions.
"""
from rest_framework import serializers
from .models import SubscriptionPass, TrainingSession, TrainingRegistration


class SubscriptionPassSerializer(serializers.ModelSerializer):
    """Serializer pour les pass d'abonnement."""
    class Meta:
        model = SubscriptionPass
        fields = [
            "id", "name", "slug", "price", "description", "benefits",
            "duration_days", "sessions_included", "is_active", "order",
            "created_at", "updated_at"
        ]


class TrainingSessionSerializer(serializers.ModelSerializer):
    """Serializer pour les sessions de training."""
    instructor_display = serializers.ReadOnlyField()
    level_name = serializers.ReadOnlyField(source="level.name")
    registrations_count = serializers.SerializerMethodField()
    spots_left = serializers.SerializerMethodField()

    class Meta:
        model = TrainingSession
        fields = [
            "id", "title", "slug", "description", "instructor", "instructor_name",
            "instructor_display", "date", "duration_minutes", "capacity", "location",
            "level", "level_name", "is_cancelled", "registrations_count", "spots_left",
            "created_at", "updated_at"
        ]

    def get_registrations_count(self, obj):
        return obj.registrations.filter(status="confirmed").count()

    def get_spots_left(self, obj):
        confirmed = obj.registrations.filter(status="confirmed").count()
        return max(0, obj.capacity - confirmed)


class TrainingRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour les inscriptions aux sessions."""
    session_title = serializers.ReadOnlyField(source="session.title")
    user_username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = TrainingRegistration
        fields = ["id", "user", "user_username", "session", "session_title", "status", "created_at"]
        read_only_fields = ["id", "created_at"]
