from django.contrib import admin
from .models import Course, Schedule, Enrollment, TheoryLesson


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "style", "level", "node", "is_active")
    list_filter = ("style", "level", "node", "is_active")
    filter_horizontal = ("teachers",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("course", "day_of_week", "start_time", "end_time", "location_name")
    list_filter = ("course", "day_of_week")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "enrolled_at", "is_active")
    list_filter = ("course", "is_active")


@admin.register(TheoryLesson)
class TheoryLessonAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "category", "level", "duration_minutes", "is_active")
    list_filter = ("category", "level", "is_active")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "content")
