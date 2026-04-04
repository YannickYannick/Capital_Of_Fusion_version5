"""
Modèle User personnalisé — AbstractUser + user_type/staff_role + champs danse.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    3 types d'utilisateurs :
    - ADMIN  : superutilisateur, peut tout valider.
    - STAFF  : membre de l'équipe CoF, peut créer du contenu selon son rôle.
    - MEMBER : utilisateur standard, s'inscrit aux événements.
    """

    class UserType(models.TextChoices):
        ADMIN = "ADMIN", "Administrateur"
        STAFF = "STAFF", "Staff Capital of Fusion"
        MEMBER = "MEMBER", "Membre"

    class StaffRole(models.TextChoices):
        TEACHER = "TEACHER", "Enseignant"
        ORGANIZER = "ORGANIZER", "Organisateur"
        ARTIST = "ARTIST", "Artiste"
        CARE = "CARE", "Praticien / Care"
        SHOP = "SHOP", "Boutique"
        COMMUNICATIONS = "COMMUNICATIONS", "Communication"

    # ─── Rôle & type ─────────────────────────────────────────────────────────
    user_type = models.CharField(
        max_length=10,
        choices=UserType.choices,
        default=UserType.MEMBER,
        verbose_name="Type d'utilisateur",
    )
    staff_role = models.CharField(
        max_length=20,
        choices=StaffRole.choices,
        blank=True,
        verbose_name="Rôle (Staff uniquement)",
    )
    pole = models.ForeignKey(
        "organization.Pole",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
        verbose_name="Pôle (Staff / Admin)",
        help_text="Pôle d'appartenance pour les comptes Staff et Admin. Le nombre de membres par pôle est calculé automatiquement.",
    )

    class AccountStatus(models.TextChoices):
        PENDING = "PENDING", "En attente de validation"
        APPROVED = "APPROVED", "Approuvé"
        REJECTED = "REJECTED", "Refusé"

    account_status = models.CharField(
        max_length=10,
        choices=AccountStatus.choices,
        default=AccountStatus.APPROVED,
        verbose_name="Statut du compte",
    )

    # ─── Profil danse ─────────────────────────────────────────────────────────
    phone = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True, verbose_name="Biographie (français)")
    bio_en = models.TextField(blank=True, verbose_name="Biographie (anglais)")
    bio_es = models.TextField(blank=True, verbose_name="Biographie (espagnol)")
    profile_picture = models.ImageField(
        upload_to="Artistes/",
        null=True,
        blank=True,
        max_length=500,
    )
    cover_image = models.ImageField(
        upload_to="Artistes/covers/",
        null=True,
        blank=True,
        max_length=500,
        verbose_name="Image de couverture (profil public)",
    )
    dance_level = models.ForeignKey(
        "core.Level",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    is_vibe = models.BooleanField(default=False)
    is_staff_member = models.BooleanField(
        default=False,
        verbose_name="Membre du staff Capital of Fusion",
        help_text="Cocher si cet artiste fait partie de l'équipe officielle CoF."
    )
    professions = models.ManyToManyField(
        "core.DanceProfession",
        related_name="users",
        blank=True,
    )

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

    def save(self, *args, **kwargs):
        """Synchronise is_staff / is_superuser avec user_type."""
        if self.user_type == self.UserType.ADMIN:
            self.is_superuser = True
            self.is_staff = True
        elif self.user_type == self.UserType.STAFF:
            self.is_staff = True
        else:
            # MEMBER
            if not self.pk:  # uniquement à la création
                self.is_staff = False
                self.is_superuser = False
        super().save(*args, **kwargs)

    @property
    def is_admin(self) -> bool:
        return self.user_type == self.UserType.ADMIN

    @property
    def is_cof_staff(self) -> bool:
        return self.user_type == self.UserType.STAFF

    @property
    def is_member(self) -> bool:
        return self.user_type == self.UserType.MEMBER
