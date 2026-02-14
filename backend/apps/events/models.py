"""
Modèles Events — Event, EventPass, Registration. Alignés MCD Phase 1 section 1.5.
"""
from django.db import models
from apps.core.models import BaseModel


class Event(BaseModel):
    """
    Événement (festival, soirée, workshop) : type, dates, lieu, noeud, image.
    """

    class EventType(models.TextChoices):
        FESTIVAL = "FESTIVAL", "Festival"
        PARTY = "PARTY", "Soirée"
        WORKSHOP = "WORKSHOP", "Atelier"

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    type = models.CharField(max_length=20, choices=EventType.choices)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    location_name = models.CharField(max_length=255, blank=True)
    node = models.ForeignKey(
        "organization.OrganizationNode",
        on_delete=models.CASCADE,
        related_name="events",
        null=True,
        blank=True,
    )
    image = models.ImageField(upload_to="events/", null=True, blank=True)

    class Meta:
        verbose_name = "Événement"
        verbose_name_plural = "Événements"

    def __str__(self):
        return self.name


class EventPass(BaseModel):
    """Pass pour un événement (Full Pass, Social Pass…)."""

    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="passes"
    )
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    quantity_available = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Pass événement"
        verbose_name_plural = "Pass événements"

    def __str__(self):
        return f"{self.event.name} — {self.name}"


class Registration(BaseModel):
    """Inscription d'un utilisateur à un pass."""

    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="event_registrations"
    )
    event_pass = models.ForeignKey(
        EventPass, on_delete=models.CASCADE, related_name="registrations"
    )
    registered_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Inscription événement"
        verbose_name_plural = "Inscriptions événements"

    def __str__(self):
        return f"{self.user} → {self.event_pass}"
