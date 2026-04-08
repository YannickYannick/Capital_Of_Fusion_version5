"""
Modèles Partners — Partner, PartnerNode (structure comme OrganizationNode),
PartnerEvent (comme Event), PartnerCourse (comme Course), PartnerSchedule.
"""
from django.conf import settings
from django.db import models
from apps.core.models import BaseModel

from .storage import PartnerBackgroundMusicStorage


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
    profile_image = models.ImageField(
        upload_to="partners/nodes/profiles/",
        blank=True,
        null=True,
        verbose_name="Photo de profil",
    )
    cover_image = models.ImageField(
        upload_to="partners/nodes/covers/",
        blank=True,
        null=True,
        verbose_name="Image de couverture",
    )
    external_links = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Liens & contact",
        help_text="Instagram (max 3), sites web (max 3), Facebook, contact.",
    )
    short_description = models.CharField(max_length=300, blank=True)
    content = models.TextField(blank=True, verbose_name="Contenu détaillé")
    cta_text = models.CharField(max_length=50, blank=True, default="En savoir plus")
    cta_url = models.CharField(max_length=200, blank=True)
    background_music = models.FileField(
        upload_to="partners/nodes/music/",
        storage=PartnerBackgroundMusicStorage(),
        blank=True,
        null=True,
        verbose_name="Musique de fond (fichier)",
        help_text="MP3, OGG, etc. Si une URL YouTube est aussi renseignée, c’est YouTube qui est joué en priorité.",
    )
    background_music_youtube_url = models.URLField(
        max_length=512,
        blank=True,
        verbose_name="Musique de fond (YouTube)",
        help_text="Lien watch ou youtu.be ; la piste joue à la place du son des vidéos d’accueil sur la fiche structure.",
    )
    linked_artists = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="linked_partner_structures",
        blank=True,
        verbose_name="Artistes associés",
        help_text="Profils annuaire (utilisateurs avec au moins une profession danse).",
    )

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
    external_links = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Liens & contact",
        help_text="Instagram (max 3), sites web (max 3), Facebook, contact.",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    location_name = models.CharField(max_length=255, blank=True)
    profile_image = models.ImageField(
        upload_to="partners/events/profiles/",
        blank=True,
        null=True,
        max_length=500,
        verbose_name="Photo de profil",
    )
    cover_image = models.ImageField(
        upload_to="partners/events/covers/",
        blank=True,
        null=True,
        max_length=500,
        verbose_name="Image de couverture",
    )
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
    location_name = models.CharField(max_length=255, blank=True, verbose_name="Lieu (texte)")
    external_links = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Liens & contact",
        help_text="Instagram (max 3), sites web (max 3), Facebook, contact.",
    )
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
    level = models.ForeignKey(
        "core.Level",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="partner_schedules",
        verbose_name="Niveau (créneau)",
    )

    class Meta:
        verbose_name = "Horaire partenaire"
        verbose_name_plural = "Horaires partenaires"

    def __str__(self):
        return f"{self.course.name} — {self.get_day_of_week_display()} {self.start_time}"
