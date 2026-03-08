"""
Serializers Organization — Pole, OrganizationNode (paramètres 3D) + NodeEvent pour overlay.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import OrganizationNode, NodeEvent, Pole

User = get_user_model()


class PoleSerializer(serializers.ModelSerializer):
    """Pôle avec nombre de membres (staff/admin) calculé côté API."""

    members_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Pole
        fields = ("id", "name", "slug", "order", "members_count")


class StaffMemberSerializer(serializers.Serializer):
    """Membre du staff (User STAFF ou ADMIN) pour la page Organisation > Staff."""
    id = serializers.UUIDField(read_only=True)
    username = serializers.CharField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    profile_picture = serializers.SerializerMethodField()
    staff_role = serializers.CharField(read_only=True, allow_blank=True)
    staff_role_display = serializers.SerializerMethodField()
    pole = serializers.SerializerMethodField()
    bio = serializers.CharField(read_only=True, allow_blank=True)

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None

    def get_staff_role_display(self, obj):
        return obj.get_staff_role_display() if getattr(obj, "staff_role", None) else ""

    def get_pole(self, obj):
        pole = getattr(obj, "pole", None)
        if pole:
            return {"id": str(pole.id), "name": pole.name, "slug": pole.slug}
        return None


class NodeEventSerializer(serializers.ModelSerializer):
    """Événement d'un noeud (overlay)."""

    class Meta:
        model = NodeEvent
        fields = (
            "id",
            "title",
            "description",
            "start_datetime",
            "end_datetime",
            "location",
            "is_featured",
            "external_url",
        )


class OrganizationNodeSerializer(serializers.ModelSerializer):
    """Noeud avec paramètres 3D et événements pour Explore / overlay / organigramme."""

    node_events = NodeEventSerializer(many=True, read_only=True)
    parent_slug = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationNode
        fields = (
            "id",
            "name",
            "slug",
            "type",
            "parent_slug",
            "description",
            "short_description",
            "cta_text",
            "cta_url",
            "video_url",
            "cover_image",
            "content",
            "music_type",
            "music_youtube_url",
            "music_file",
            "visual_source",
            "planet_type",
            "model_3d",
            "planet_texture",
            "planet_color",
            "orbit_radius",
            "orbit_speed",
            "planet_scale",
            "rotation_speed",
            "orbit_phase",
            "orbit_position_y",
            "orbit_shape",
            "orbit_roundness",
            "entry_start_x",
            "entry_start_y",
            "entry_start_z",
            "entry_speed",
            "is_visible_3d",
            "node_events",
        )

    def get_parent_slug(self, obj):
        return obj.parent.slug if obj.parent else None
