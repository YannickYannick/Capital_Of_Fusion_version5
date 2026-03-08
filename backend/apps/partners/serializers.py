"""
Serializers Partners — PartnerNode, PartnerEvent, PartnerCourse (lecture seule pour l’API publique).
"""
from rest_framework import serializers
from .models import Partner, PartnerNode, PartnerEvent, PartnerCourse, PartnerSchedule


class PartnerMinimalSerializer(serializers.ModelSerializer):
    """Partenaire minimal (nom, slug) pour les listes."""

    class Meta:
        model = Partner
        fields = ("id", "name", "slug")


class PartnerNodeSerializer(serializers.ModelSerializer):
    """Structure partenaire pour liste et détail (avec parent_slug pour arbre)."""

    parent_slug = serializers.SerializerMethodField()

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
            "cover_image",
            "content",
            "cta_text",
            "cta_url",
            "partner",
        )

    def get_parent_slug(self, obj):
        return obj.parent.slug if obj.parent else None


class PartnerEventSerializer(serializers.ModelSerializer):
    """Événement partenaire pour GET /api/partners/events/."""

    node_name = serializers.CharField(
        source="node.name", read_only=True, allow_null=True
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
            "start_date",
            "end_date",
            "location_name",
            "node",
            "node_name",
            "partner",
            "partner_name",
            "image",
        )
        read_only_fields = fields


class PartnerScheduleSerializer(serializers.ModelSerializer):
    """Horaire d'un cours partenaire."""

    day_display = serializers.CharField(source="get_day_of_week_display", read_only=True)

    class Meta:
        model = PartnerSchedule
        fields = (
            "id",
            "day_of_week",
            "day_display",
            "start_time",
            "end_time",
            "location_name",
        )


class PartnerCourseSerializer(serializers.ModelSerializer):
    """Cours partenaire pour GET /api/partners/courses/."""

    style_name = serializers.CharField(source="style.name", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)
    node_name = serializers.CharField(
        source="node.name", read_only=True, allow_null=True
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
            "style",
            "style_name",
            "level",
            "level_name",
            "node",
            "node_name",
            "partner",
            "partner_name",
            "is_active",
            "image",
            "schedules",
        )
        read_only_fields = fields
