"""
Serializers Courses — Course pour l’API catalogue.
"""
from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    """Course en lecture seule pour GET /api/courses/."""

    style_name = serializers.CharField(source="style.name", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)
    node_name = serializers.CharField(source="node.name", read_only=True)

    class Meta:
        model = Course
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
            "is_active",
            "image",
        )
        read_only_fields = fields
