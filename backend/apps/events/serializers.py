"""
Serializers Events — Event pour l’API calendrier.
"""
from rest_framework import serializers
from .models import Event, FestivalShuttleDeparture, FestivalProgramSlot


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


class EventWriteSerializer(serializers.ModelSerializer):
    """Event en écriture pour les endpoints admin (POST/PUT/PATCH)."""

    class Meta:
        model = Event
        fields = (
            "name",
            "slug",
            "type",
            "description",
            "start_date",
            "end_date",
            "location_name",
            "node",
            "image",
        )


class FestivalShuttleDepartureSerializer(serializers.ModelSerializer):
    """Départ navette — lecture publique."""

    class Meta:
        model = FestivalShuttleDeparture
        fields = (
            "id",
            "edition",
            "day_id",
            "day_label",
            "day_date",
            "iso_date",
            "direction",
            "departure_time",
            "sort_order",
        )
        read_only_fields = fields


class FestivalProgramSlotSerializer(serializers.ModelSerializer):
    """Créneau planning festival — format app mobile."""

    day = serializers.CharField(source="day_id", read_only=True)
    artist = serializers.CharField(source="title", read_only=True)
    stage = serializers.CharField(source="room", read_only=True)
    start = serializers.CharField(source="start_time", read_only=True)
    end = serializers.CharField(source="end_time", read_only=True)
    genre = serializers.SerializerMethodField()
    live = serializers.BooleanField(source="is_live", read_only=True)
    notInFullPass = serializers.BooleanField(source="not_in_full_pass", read_only=True)

    class Meta:
        model = FestivalProgramSlot
        fields = (
            "id",
            "day",
            "artist",
            "genre",
            "stage",
            "start",
            "end",
            "live",
            "category",
            "level",
            "style",
            "notInFullPass",
        )
        read_only_fields = fields

    def get_genre(self, obj) -> str:
        parts = []
        if obj.style:
            parts.append(obj.style)
        if obj.level:
            label = dict(FestivalProgramSlot.Level.choices).get(obj.level, obj.level)
            if label and label != "—":
                parts.append(label)
        return " · ".join(parts) if parts else obj.category

