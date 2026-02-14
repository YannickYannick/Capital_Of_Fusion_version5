"""
Serializers Events — Event pour l’API calendrier.
"""
from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Event en lecture seule pour GET /api/events/."""

    node_name = serializers.CharField(
        source="node.name", read_only=True, allow_null=True
    )

    class Meta:
        model = Event
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
            "image",
        )
        read_only_fields = fields
