"""
Modèles Partners — Partner, PartnerNode (structure comme OrganizationNode),
PartnerEvent (comme Event), PartnerCourse (comme Course), PartnerSchedule.
"""
from django.db import models
from apps.core.models import BaseModel


class Partner(BaseModel):
    """Partenaire : structure/organisation partenaire de CoF."""

    name = models.CharField(max_length=255, verbose_name="Nom")
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, verbose_name="Description")
    logo = models.ImageField(
        upload_to="partners/logos/",
        blank=True,
        null=True,
        verbose_name="Logo",
    )

    class Meta:
        verbose_name = "Partenaire"
        verbose_name_plural = "Partenaires"
        ordering = ["name"]

    def __str__(self):
        return self.name


class PartnerNode(BaseModel):
    """
    Structure partenaire (même logique qu'OrganizationNode pour la fiche).
    Pas de champs 3D. Arbre possible via parent.
    """

    class NodeType(models.TextChoices):
        ROOT = "ROOT", "Racine"
        BRANCH = "BRANCH", "Branche"
        EVENT = "EVENT", "Événement"

    partner = models.ForeignKey(
        Partner,
        on_delete=models.CASCADE,
        related_name="nodes",
        null=True,
        blank=True,
        verbose_name="Partenaire",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    type = models.CharField(
        max_length=20, choices=NodeType.choices, default=NodeType.BRANCH
    )
    description = models.TextField(blank=True)
    cover_image = models.ImageField(
        upload_to="partners/nodes/covers/",
        blank=True,
        null=True,
        verbose_name="Image de couverture",
    )
    short_description = models.CharField(max_length=300, blank=True)
    content = models.TextField(blank=True, verbose_name="Contenu détaillé")
    cta_text = models.CharField(max_length=50, blank=True, default="En savoir plus")
    cta_url = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = "Structure partenaire"
        verbose_name_plural = "Structures partenaires"
        ordering = ["name"]

    def __str__(self):
        return self.name


class PartnerEvent(BaseModel):
    """Événement partenaire (même structure qu'Event)."""

    class EventType(models.TextChoices):
        FESTIVAL = "FESTIVAL", "Festival"
        PARTY = "PARTY", "Soirée"
        WORKSHOP = "WORKSHOP", "Atelier"

    partner = models.ForeignKey(
        Partner,
        on_delete=models.CASCADE,
        related_name="events",
        null=True,
        blank=True,
        verbose_name="Partenaire",
    )
    node = models.ForeignKey(
        PartnerNode,
        on_delete=models.CASCADE,
        related_name="events",
        null=True,
        blank=True,
        verbose_name="Structure partenaire",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    type = models.CharField(max_length=20, choices=EventType.choices)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    location_name = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="partners/events/", null=True, blank=True)

    class Meta:
        verbose_name = "Événement partenaire"
        verbose_name_plural = "Événements partenaires"
        ordering = ["-start_date"]

    def __str__(self):
        return self.name


class PartnerCourse(BaseModel):
    """Cours partenaire (même structure que Course)."""

    partner = models.ForeignKey(
        Partner,
        on_delete=models.CASCADE,
        related_name="courses",
        null=True,
        blank=True,
        verbose_name="Partenaire",
    )
    node = models.ForeignKey(
        PartnerNode,
        on_delete=models.CASCADE,
        related_name="courses",
        null=True,
        blank=True,
        verbose_name="Structure partenaire",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True)
    style = models.ForeignKey(
        "core.DanceStyle",
        on_delete=models.CASCADE,
        related_name="partner_courses",
    )
    level = models.ForeignKey(
        "core.Level",
        on_delete=models.CASCADE,
        related_name="partner_courses",
    )
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to="partners/courses/", null=True, blank=True)
    teachers = models.ManyToManyField(
        "users.User",
        related_name="taught_partner_courses",
        blank=True,
    )

    class Meta:
        verbose_name = "Cours partenaire"
        verbose_name_plural = "Cours partenaires"
        ordering = ["name"]

    def __str__(self):
        return self.name


class PartnerSchedule(BaseModel):
    """Horaire récurrent d'un cours partenaire."""

    course = models.ForeignKey(
        PartnerCourse,
        on_delete=models.CASCADE,
        related_name="schedules",
    )
    DAY_CHOICES = [
        (0, "Lundi"),
        (1, "Mardi"),
        (2, "Mercredi"),
        (3, "Jeudi"),
        (4, "Vendredi"),
        (5, "Samedi"),
        (6, "Dimanche"),
    ]
    day_of_week = models.PositiveSmallIntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location_name = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "Horaire partenaire"
        verbose_name_plural = "Horaires partenaires"

    def __str__(self):
        return f"{self.course.name} — {self.get_day_of_week_display()} {self.start_time}"
