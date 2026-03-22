from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        "username", "email", "first_name", "last_name",
        "user_type", "staff_role", "pole", "is_active",
    ]
    list_filter = ["user_type", "staff_role", "pole", "is_active", "is_staff"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["username"]

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
                "dance_level",
                "is_vibe",
                "professions",
            ),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Rôle Capital of Fusion", {
            "fields": ("user_type", "staff_role", "pole"),
        }),
    )
