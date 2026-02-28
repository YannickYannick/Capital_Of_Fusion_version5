"""
Serializers Courses — Course et TheoryLesson pour l'API catalogue.
"""
from rest_framework import serializers
from .models import Course, TheoryLesson


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


class TheoryLessonSerializer(serializers.ModelSerializer):
    """TheoryLesson en lecture seule pour GET /api/courses/theory/."""

    level_name = serializers.CharField(source="level.name", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = TheoryLesson
        fields = (
            "id",
            "title",
            "slug",
            "category",
            "category_display",
            "level",
            "level_name",
            "content",
            "video_url",
            "duration_minutes",
            "is_active",
        )
        read_only_fields = fields
