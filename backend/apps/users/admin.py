from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        "username",
        "artist_display_order",
        "email",
        "first_name",
        "last_name",
        "user_type",
        "staff_role",
        "pole",
        "is_active",
    ]
    list_editable = ["artist_display_order"]
    list_filter = ["user_type", "staff_role", "pole", "is_active", "is_staff"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["artist_display_order", "username"]

    # Ajouter les champs custom dans le formulaire d'édition
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Rôle Capital of Fusion", {
            "fields": ("user_type", "staff_role", "pole"),
        }),
        ("Profil Danse", {
            "fields": (
                "phone",
                "bio",
                "bio_en",
                "bio_es",
                "profile_picture",
                "cover_image",
                "dance_level",
                "is_vibe",
                "is_staff_member",
                "artist_display_order",
                "professions",
            ),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Rôle Capital of Fusion", {
            "fields": ("user_type", "staff_role", "pole"),
        }),
    )
