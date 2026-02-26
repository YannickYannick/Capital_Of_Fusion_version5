"""
Serializers Organization — OrganizationNode (paramètres 3D) + NodeEvent pour overlay.
"""
from rest_framework import serializers
from .models import OrganizationNode, NodeEvent


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
    """Noeud avec paramètres 3D et événements pour Explore / overlay."""

    node_events = NodeEventSerializer(many=True, read_only=True)

    class Meta:
        model = OrganizationNode
        fields = (
            "id",
            "name",
            "slug",
            "type",
            "description",
            "short_description",
            "cta_text",
            "cta_url",
            "video_url",
            "cover_image",
            "content",
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
