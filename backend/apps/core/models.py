"""
Modèles Core — BaseModel abstrait, DanceStyle, Level, DanceProfession,
SiteConfiguration, MenuItem.
Alignés sur le MCD Phase 1 (sections 1.1).
"""
import uuid
from django.db import models


class BaseModel(models.Model):
    """
    Modèle abstrait : id UUID, created_at, updated_at.
    Hérité par la plupart des entités du projet.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class DanceStyle(BaseModel):
    """
    Style de danse, récursif (parent pour sous-styles).
    Ex. Bachata Sensual ⊂ Bachata.
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="sub_styles"
    )
    icon = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Style de danse"
        verbose_name_plural = "Styles de danse"

    def __str__(self):
        return self.name


class Level(BaseModel):
    """
    Niveau de danse (débutant, intermédiaire, avancé, professionnel).
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    order = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Niveau"
        verbose_name_plural = "Niveaux"
        ordering = ["order"]

    def __str__(self):
        return self.name


class DanceProfession(BaseModel):
    """
    Métier du monde de la danse (professeur, DJ, caméraman…).
    Un utilisateur peut en avoir plusieurs (M-N avec User).
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Métier de la danse"
        verbose_name_plural = "Métiers de la danse"

    def __str__(self):
        return self.name


class SiteConfiguration(models.Model):
    """
    Configuration singleton du site (hero, nom, etc.).
    Une seule instance (pk=1) utilisée pour les réglages globaux.
    """

    site_name = models.CharField(max_length=255, blank=True)
    hero_title = models.CharField(max_length=255, blank=True)
    hero_subtitle = models.TextField(blank=True)
    # Remplacé par les nouveaux champs avancés
    # hero_video_url = models.URLField(blank=True)

    # Paramètres de la vidéo principale
    VIDEO_CHOICES = (
        ('youtube', 'Vidéo YouTube'),
        ('mp4', 'Fichier Local (MP4)'),
    )
    main_video_type = models.CharField(max_length=10, choices=VIDEO_CHOICES, default='youtube', verbose_name="Type Vidéo Principale")
    main_video_youtube_id = models.CharField(max_length=50, blank=True, default="Dqg0oKlXpTE", verbose_name="ID YouTube Principale")
    main_video_file = models.FileField(upload_to='videos/', blank=True, null=True, verbose_name="Fichier MP4 Principale")

    # Paramètres de la vidéo cyclique
    cycle_video_type = models.CharField(max_length=10, choices=VIDEO_CHOICES, default='youtube', verbose_name="Type Vidéo Cycle")
    cycle_video_youtube_id = models.CharField(max_length=50, blank=True, default="eZhq_RMYRKQ", verbose_name="ID YouTube Cycle")
    cycle_video_file = models.FileField(upload_to='videos/', blank=True, null=True, verbose_name="Fichier MP4 Cycle")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuration du site"
        verbose_name_plural = "Configuration du site"

    def __str__(self):
        return self.site_name or "Configuration"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class MenuItem(BaseModel):
    """
    Élément du menu navbar, récursif (parent → children).
    Ordre d'affichage par champ order.
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    url = models.CharField(max_length=500, blank=True)
    icon = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Élément de menu"
        verbose_name_plural = "Éléments de menu"
        ordering = ["order"]

    def __str__(self):
        return self.name
