"""
Modèles Trainings — Pass d'abonnement et sessions de formation.
Héritent de BaseModel (UUID, created_at, updated_at).
"""
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel


class SubscriptionPass(BaseModel):
    """
    Pass d'abonnement pour les trainings libres.
    Permet aux adhérents d'accéder aux sessions selon leur formule.
    """
    name = models.CharField(max_length=100, verbose_name="Nom du pass")
    slug = models.SlugField(unique=True, max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix (€)")
    description = models.TextField(verbose_name="Description")
    benefits = models.JSONField(default=list, verbose_name="Avantages", help_text="Liste des avantages du pass")
    duration_days = models.PositiveIntegerField(default=30, verbose_name="Durée (jours)")
    sessions_included = models.PositiveIntegerField(null=True, blank=True, verbose_name="Nombre de sessions incluses", help_text="Null = illimité")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")

    class Meta:
        verbose_name = "Pass d'abonnement"
        verbose_name_plural = "Pass d'abonnement"
        ordering = ["order", "price"]

    def __str__(self):
        return self.name


class TrainingSession(BaseModel):
    """
    Session de training libre (entraînement, pratique).
    """
    title = models.CharField(max_length=255, verbose_name="Titre")
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField(blank=True, verbose_name="Description")
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="training_sessions",
        verbose_name="Instructeur"
    )
    instructor_name = models.CharField(max_length=100, blank=True, verbose_name="Nom instructeur (si externe)")
    date = models.DateTimeField(verbose_name="Date et heure")
    duration_minutes = models.PositiveIntegerField(default=90, verbose_name="Durée (minutes)")
    capacity = models.PositiveIntegerField(default=20, verbose_name="Capacité max")
    location = models.CharField(max_length=255, blank=True, verbose_name="Lieu")
    level = models.ForeignKey(
        "core.Level",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Niveau"
    )
    is_cancelled = models.BooleanField(default=False, verbose_name="Annulé")

    class Meta:
        verbose_name = "Session de training"
        verbose_name_plural = "Sessions de training"
        ordering = ["date"]

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%d/%m/%Y %H:%M')}"

    @property
    def instructor_display(self):
        if self.instructor:
            return self.instructor.get_full_name() or self.instructor.username
        return self.instructor_name or "Non assigné"


class TrainingRegistration(BaseModel):
    """
    Inscription d'un utilisateur à une session de training.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="training_registrations"
    )
    session = models.ForeignKey(
        TrainingSession,
        on_delete=models.CASCADE,
        related_name="registrations"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("confirmed", "Confirmé"),
            ("waitlist", "Liste d'attente"),
            ("cancelled", "Annulé"),
        ],
        default="confirmed"
    )

    class Meta:
        verbose_name = "Inscription training"
        verbose_name_plural = "Inscriptions training"
        unique_together = ["user", "session"]

    def __str__(self):
        return f"{self.user.username} → {self.session.title}"
