from django.contrib import admin
from .models import ProjectCategory, Project


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "start_date", "created_at"]
    list_filter = ["status", "category"]
    search_fields = ["title", "summary"]
    prepopulated_fields = {"slug": ("title",)}
