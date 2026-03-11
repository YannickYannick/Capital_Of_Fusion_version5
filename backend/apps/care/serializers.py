"""
Serializers Care — Praticiens et services.
"""
from rest_framework import serializers
from .models import Practitioner, ServiceCategory, Service


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de soins."""
    services_count = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "slug", "description", "icon", "order", "services_count"]

    def get_services_count(self, obj):
        return obj.services.filter(is_available=True).count()


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer pour les services/soins."""
    practitioner_name = serializers.ReadOnlyField(source="practitioner.name")
    practitioner_slug = serializers.ReadOnlyField(source="practitioner.slug")
    category_name = serializers.ReadOnlyField(source="category.name")

    class Meta:
        model = Service
        fields = [
            "id", "practitioner", "practitioner_name", "practitioner_slug",
            "category", "category_name", "title", "slug", "description",
            "short_description", "duration_minutes", "price", "image",
            "is_available", "order", "created_at", "updated_at"
        ]


class PractitionerSerializer(serializers.ModelSerializer):
    """Serializer pour les praticiens."""
    services = ServiceSerializer(many=True, read_only=True)
    services_count = serializers.SerializerMethodField()

    class Meta:
        model = Practitioner
        fields = [
            "id", "name", "slug", "specialty", "bio", "short_bio",
            "profile_image", "phone", "email", "website", "booking_url",
            "is_active", "order", "services", "services_count",
            "created_at", "updated_at"
        ]

    def get_services_count(self, obj):
        return obj.services.filter(is_available=True).count()


class PractitionerListSerializer(serializers.ModelSerializer):
    """Serializer allégé pour les listes de praticiens."""
    services_count = serializers.SerializerMethodField()

    class Meta:
        model = Practitioner
        fields = [
            "id", "name", "slug", "specialty", "short_bio",
            "profile_image", "booking_url", "is_active", "services_count"
        ]

    def get_services_count(self, obj):
        return obj.services.filter(is_available=True).count()
