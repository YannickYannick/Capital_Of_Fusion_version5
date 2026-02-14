"""
Modèle User personnalisé — AbstractUser + champs optionnels,
dance_level (FK Level), is_vibe, M-N DanceProfession.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Utilisateur : hérite AbstractUser + phone, bio, profile_picture,
    dance_level (FK Level), is_vibe, professions (M-N DanceProfession).
    """

    phone = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="profiles/", null=True, blank=True)
    dance_level = models.ForeignKey(
        "core.Level",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    is_vibe = models.BooleanField(default=False)
    professions = models.ManyToManyField(
        "core.DanceProfession",
        related_name="users",
        blank=True,
    )

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return self.username
