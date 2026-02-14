from django.contrib import admin
from .models import Course, Schedule, Enrollment


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
