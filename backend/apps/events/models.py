"""
Modèles Events — Event, EventPass, Registration. Alignés MCD Phase 1 section 1.5.
"""
from django.db import models
from django.utils import timezone
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


class FestivalShuttleDeparture(BaseModel):
    """
    Départ navette festival (Palmeraie ↔ hôtel).
    Source : affiches officielles PBVF 2026.
    """

    class Direction(models.TextChoices):
        TO_HOTEL = "to_hotel", "Palmeraie → Hôtel"
        TO_PALMERAIE = "to_palmeraie", "Hôtel → Palmeraie"

    edition = models.CharField(max_length=8, default="2026", db_index=True)
    day_id = models.CharField(max_length=8, help_text="jeu, ven, sam, dim")
    day_label = models.CharField(max_length=32)
    day_date = models.CharField(max_length=32, help_text="ex. 17 sept.")
    iso_date = models.DateField()
    direction = models.CharField(max_length=16, choices=Direction.choices)
    departure_time = models.CharField(max_length=5, help_text="HH:MM")
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "Départ navette festival"
        verbose_name_plural = "Départs navettes festival"
        ordering = ["iso_date", "direction", "sort_order"]
        indexes = [
            models.Index(fields=["edition", "day_id", "direction"]),
        ]

    def __str__(self):
        return f"{self.day_label} {self.departure_time} — {self.get_direction_display()}"


class FestivalProgramSlot(BaseModel):
    """
    Créneau planning festival (workshops, soirées, compétitions).
    Source : affiches officielles PBVF 2026 (notre-programme).
    """

    class Category(models.TextChoices):
        WORKSHOP = "workshop", "Workshop"
        PARTY = "party", "Soirée"
        BREAK = "break", "Pause"
        COMPETITION = "competition", "Compétition"
        SOCIAL = "social", "Social"
        INFO = "info", "Info"
        CONCERT = "concert", "Concert"

    class Level(models.TextChoices):
        OPEN = "open", "Open"
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"
        NONE = "", "—"

    edition = models.CharField(max_length=8, default="2026", db_index=True)
    day_id = models.CharField(max_length=8, help_text="jeu, ven, sam, dim")
    day_label = models.CharField(max_length=32)
    day_date = models.CharField(max_length=32, help_text="ex. 17 sept.")
    iso_date = models.DateField()
    room = models.CharField(max_length=64, help_text="La Casa Room, La Escuela, …")
    start_time = models.CharField(max_length=5, help_text="HH:MM")
    end_time = models.CharField(max_length=5, help_text="HH:MM")
    title = models.CharField(max_length=255)
    style = models.CharField(max_length=255, blank=True, help_text="Style / sous-titre")
    level = models.CharField(max_length=16, choices=Level.choices, blank=True, default="")
    category = models.CharField(max_length=16, choices=Category.choices, default=Category.WORKSHOP)
    is_live = models.BooleanField(default=False)
    not_in_full_pass = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "Créneau planning festival"
        verbose_name_plural = "Créneaux planning festival"
        ordering = ["iso_date", "room", "sort_order", "start_time"]
        indexes = [
            models.Index(fields=["edition", "day_id"]),
            models.Index(fields=["edition", "room"]),
        ]

    def __str__(self):
        return f"{self.day_label} {self.start_time} — {self.title} ({self.room})"


class FestivalAnnouncement(BaseModel):
    """
    Annonce festival mobile/PWA.
    urgent = bandeau toutes pages ; normal = fil accueil.
    """

    class Priority(models.TextChoices):
        URGENT = "urgent", "Urgent (bandeau)"
        NORMAL = "normal", "Normal (accueil)"

    edition = models.CharField(max_length=16, default="2026", db_index=True)
    title = models.CharField(max_length=200)
    body = models.TextField()
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.NORMAL,
        db_index=True,
    )
    is_published = models.BooleanField(default=True)
    starts_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Vide = visible dès publication",
    )
    ends_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Vide = pas de fin automatique",
    )
    link_url = models.CharField(
        max_length=500,
        blank=True,
        help_text="URL absolue ou chemin app (/passes, /code-of-conduct…)",
    )
    link_label = models.CharField(max_length=80, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Annonce festival"
        verbose_name_plural = "Annonces festival"
        ordering = ["-priority", "sort_order", "-created_at"]

    def __str__(self):
        return f"[{self.priority}] {self.title}"

    def is_active_at(self, moment=None) -> bool:
        """True si publiée et dans la fenêtre starts_at / ends_at."""
        if not self.is_published:
            return False
        now = moment or timezone.now()
        if self.starts_at and now < self.starts_at:
            return False
        if self.ends_at and now > self.ends_at:
            return False
        return True
