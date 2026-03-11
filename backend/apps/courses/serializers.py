"""
Serializers Courses — Course, Schedule et TheoryLesson pour l'API catalogue.
"""
from rest_framework import serializers
from .models import Course, Schedule, TheoryLesson


class ScheduleSerializer(serializers.ModelSerializer):
    """Horaire d'un cours."""
    day_display = serializers.CharField(source="get_day_of_week_display", read_only=True)
    start_time_str = serializers.SerializerMethodField()
    end_time_str = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = (
            "id",
            "day_of_week",
            "day_display",
            "start_time",
            "end_time",
            "start_time_str",
            "end_time_str",
            "location_name",
        )
        read_only_fields = fields

    def get_start_time_str(self, obj):
        return obj.start_time.strftime("%H:%M") if obj.start_time else None

    def get_end_time_str(self, obj):
        return obj.end_time.strftime("%H:%M") if obj.end_time else None


class TeacherSerializer(serializers.Serializer):
    """Enseignant simplifié pour l'affichage."""
    id = serializers.UUIDField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    display_name = serializers.SerializerMethodField()
    profile_image = serializers.ImageField()

    def get_display_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username


class CourseSerializer(serializers.ModelSerializer):
    """Course en lecture seule pour GET /api/courses/."""

    style_name = serializers.CharField(source="style.name", read_only=True)
    style_slug = serializers.CharField(source="style.slug", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)
    level_slug = serializers.CharField(source="level.slug", read_only=True)
    level_color = serializers.CharField(source="level.color", read_only=True)
    node_name = serializers.CharField(source="node.name", read_only=True)
    node_slug = serializers.CharField(source="node.slug", read_only=True)
    schedules = ScheduleSerializer(many=True, read_only=True)
    teachers = TeacherSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "style",
            "style_name",
            "style_slug",
            "level",
            "level_name",
            "level_slug",
            "level_color",
            "node",
            "node_name",
            "node_slug",
            "is_active",
            "image",
            "schedules",
            "teachers",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class CourseListSerializer(serializers.ModelSerializer):
    """Course allégé pour les listes (sans schedules détaillés)."""

    style_name = serializers.CharField(source="style.name", read_only=True)
    style_slug = serializers.CharField(source="style.slug", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)
    level_slug = serializers.CharField(source="level.slug", read_only=True)
    level_color = serializers.CharField(source="level.color", read_only=True)
    node_name = serializers.CharField(source="node.name", read_only=True)
    teachers_count = serializers.SerializerMethodField()
    schedules_count = serializers.SerializerMethodField()
    next_schedule = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "style",
            "style_name",
            "style_slug",
            "level",
            "level_name",
            "level_slug",
            "level_color",
            "node",
            "node_name",
            "is_active",
            "image",
            "teachers_count",
            "schedules_count",
            "next_schedule",
        )
        read_only_fields = fields

    def get_teachers_count(self, obj):
        return obj.teachers.count()

    def get_schedules_count(self, obj):
        return obj.schedules.count()

    def get_next_schedule(self, obj):
        """Retourne le prochain horaire de la semaine."""
        from datetime import datetime
        today = datetime.now().weekday()
        schedules = obj.schedules.all().order_by("day_of_week", "start_time")
        
        for schedule in schedules:
            if schedule.day_of_week >= today:
                return {
                    "day": schedule.get_day_of_week_display(),
                    "time": schedule.start_time.strftime("%H:%M"),
                    "location": schedule.location_name,
                }
        
        if schedules.exists():
            first = schedules.first()
            return {
                "day": first.get_day_of_week_display(),
                "time": first.start_time.strftime("%H:%M"),
                "location": first.location_name,
            }
        return None


class CourseWriteSerializer(serializers.ModelSerializer):
    """Course en écriture pour les endpoints admin (POST/PATCH)."""

    class Meta:
        model = Course
        fields = (
            "name",
            "slug",
            "description",
            "style",
            "level",
            "node",
            "is_active",
            "image",
            "teachers",
        )


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


class TheoryLessonWriteSerializer(serializers.ModelSerializer):
    """TheoryLesson en écriture pour les endpoints admin (POST/PATCH)."""

    class Meta:
        model = TheoryLesson
        fields = (
            "title",
            "slug",
            "category",
            "level",
            "content",
            "video_url",
            "duration_minutes",
            "is_active",
        )
