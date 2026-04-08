"""
Serializers Partners — PartnerNode, PartnerEvent, PartnerCourse (lecture seule pour l’API publique).
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.users.image_field_api_url import serialize_image_field_for_api

from .models import Partner, PartnerNode, PartnerEvent, PartnerCourse, PartnerSchedule

User = get_user_model()


class PartnerMinimalSerializer(serializers.ModelSerializer):
    """Partenaire minimal (nom, slug) pour les listes."""

    class Meta:
        model = Partner
        fields = ("id", "name", "slug")


class LinkedArtistMinimalSerializer(serializers.ModelSerializer):
    """Artiste annuaire (User avec professions) pour liens depuis une structure partenaire."""

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "profile_picture")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        data["profile_picture"] = serialize_image_field_for_api(
            getattr(instance, "profile_picture", None), request
        )
        return data


class PartnerNodeSerializer(serializers.ModelSerializer):
    """Structure partenaire pour liste et détail (avec parent_slug pour arbre)."""

    parent_slug = serializers.SerializerMethodField()
    linked_artists = LinkedArtistMinimalSerializer(many=True, read_only=True)

    class Meta:
        model = PartnerNode
        fields = (
            "id",
            "name",
            "slug",
            "type",
            "parent_slug",
            "description",
            "short_description",
            "profile_image",
            "cover_image",
            "external_links",
            "content",
            "cta_text",
            "cta_url",
            "partner",
            "background_music",
            "background_music_youtube_url",
            "linked_artists",
        )

    def get_parent_slug(self, obj):
        return obj.parent.slug if obj.parent else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        for key in ("profile_image", "cover_image"):
            data[key] = serialize_image_field_for_api(
                getattr(instance, key, None), request
            )
        data["background_music"] = serialize_image_field_for_api(
            getattr(instance, "background_music", None), request
        )
        return data


class PartnerEventSerializer(serializers.ModelSerializer):
    """Événement partenaire pour GET /api/partners/events/."""

    node_name = serializers.CharField(
        source="node.name", read_only=True, allow_null=True
    )
    node_slug = serializers.CharField(
        source="node.slug", read_only=True, allow_null=True
    )
    partner_name = serializers.CharField(
        source="partner.name", read_only=True, allow_null=True
    )

    class Meta:
        model = PartnerEvent
        fields = (
            "id",
            "name",
            "slug",
            "type",
            "description",
            "external_links",
            "start_date",
            "end_date",
            "location_name",
            "node",
            "node_name",
            "node_slug",
            "partner",
            "partner_name",
            "profile_image",
            "cover_image",
            "image",
        )
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        for key in ("image", "profile_image", "cover_image"):
            data[key] = serialize_image_field_for_api(
                getattr(instance, key, None), request
            )
        return data


class PartnerScheduleSerializer(serializers.ModelSerializer):
    """Horaire d'un cours partenaire."""

    day_display = serializers.CharField(source="get_day_of_week_display", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True, allow_null=True)

    class Meta:
        model = PartnerSchedule
        fields = (
            "id",
            "day_of_week",
            "day_display",
            "start_time",
            "end_time",
            "location_name",
            "level",
            "level_name",
        )


class PartnerCourseSerializer(serializers.ModelSerializer):
    """Cours partenaire pour GET /api/partners/courses/."""

    style_name = serializers.CharField(source="style.name", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)
    node_name = serializers.CharField(
        source="node.name", read_only=True, allow_null=True
    )
    node_slug = serializers.CharField(
        source="node.slug", read_only=True, allow_null=True
    )
    partner_name = serializers.CharField(
        source="partner.name", read_only=True, allow_null=True
    )
    schedules = PartnerScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = PartnerCourse
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "location_name",
            "external_links",
            "style",
            "style_name",
            "level",
            "level_name",
            "node",
            "node_name",
            "node_slug",
            "partner",
            "partner_name",
            "is_active",
            "image",
            "schedules",
        )
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        data["image"] = serialize_image_field_for_api(
            getattr(instance, "image", None), request
        )
        return data
