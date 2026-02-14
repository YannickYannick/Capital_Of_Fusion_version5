from django.contrib import admin
from .models import OrganizationNode, OrganizationRole, UserOrganizationRole, NodeEvent


@admin.register(OrganizationNode)
class OrganizationNodeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "type")
    list_filter = ("type",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(OrganizationRole)
class OrganizationRoleAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(UserOrganizationRole)
class UserOrganizationRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "node", "role")


@admin.register(NodeEvent)
class NodeEventAdmin(admin.ModelAdmin):
    list_display = ("title", "node", "start_datetime", "is_featured")
    list_filter = ("node", "is_featured")
