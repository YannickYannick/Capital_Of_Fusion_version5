from django.contrib import admin
from .models import ProjectCategory, Project

@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'start_date')
    search_fields = ('title', 'summary')
    list_filter = ('category', 'status')
    prepopulated_fields = {'slug': ('title',)}
