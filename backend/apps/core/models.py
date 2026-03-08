"""
Modèles Core — BaseModel abstrait, DanceStyle, Level, DanceProfession,
SiteConfiguration, MenuItem, Bulletin, PendingContentEdit.
Alignés sur le MCD Phase 1 (sections 1.1).
"""
import uuid
from django.db import models
from django.conf import settings


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


class ExplorePreset(BaseModel):
    name = models.CharField(max_length=255, default="Default Preset")
    show_orbits = models.BooleanField(default=True)
    freeze_planets = models.BooleanField(default=False)
    show_debug_info = models.BooleanField(default=False)
    fish_eye = models.FloatField(default=85)
    light_config = models.JSONField(default=dict, blank=True)
    orbit_spacing = models.FloatField(default=1)
    global_planet_scale = models.FloatField(default=2.7)
    global_shape_override = models.BooleanField(default=False)
    orbit_shape = models.CharField(max_length=50, default="circle")
    orbit_roundness = models.FloatField(default=0.6)
    mouse_force = models.FloatField(default=0.5)
    collision_force = models.FloatField(default=0.3)
    damping = models.FloatField(default=0.92)
    return_force = models.FloatField(default=0.08)
    entry_stagger = models.FloatField(default=0)
    entry_start_x = models.FloatField(default=-60)
    entry_start_y = models.FloatField(default=0)
    entry_start_z = models.FloatField(null=True, blank=True)
    entry_speed_start = models.FloatField(default=2)
    entry_speed_end = models.FloatField(default=8)
    entry_easing = models.CharField(max_length=50, default="easeOut")
    entry_duration = models.FloatField(default=3.5)
    entry_trajectory = models.CharField(max_length=50, default="fan")
    fan_distance = models.FloatField(default=30)
    orbit_speed_start = models.FloatField(default=0)
    orbit_speed_target = models.FloatField(default=0.5)
    orbit_easing = models.CharField(max_length=50, default="easeOut")
    orbital_ramp_duration = models.FloatField(default=0)
    global_orbit_speed = models.FloatField(default=0.5)
    grayscale_video = models.BooleanField(default=False)
    enable_video_cycle = models.BooleanField(default=True)
    video_cycle_visible = models.FloatField(default=10)
    video_cycle_hidden = models.FloatField(default=10)
    video_transition = models.IntegerField(default=1500)
    show_video_overlay = models.BooleanField(default=False)
    show_entry_trajectory = models.BooleanField(default=False)
    vertical_mode = models.CharField(max_length=50, default="jupiter")
    auto_distribute_orbits = models.BooleanField(default=True)
    vertical_homogeneous_base = models.FloatField(default=5)
    vertical_homogeneous_step = models.FloatField(default=20)
    vertical_jupiter_amplitude = models.FloatField(default=30)
    vertical_sphere_radius = models.FloatField(default=30)
    hover_orbit_speed_ratio = models.FloatField(default=0.333)
    hover_planet_speed_ratio = models.FloatField(default=0.1)
    hover_orbit_transition_speed = models.FloatField(default=2)
    hover_planet_transition_speed = models.FloatField(default=10)
    is_transitioning_to_explore = models.BooleanField(default=False)
    auto_reset_camera = models.BooleanField(default=False)
    auto_reset_delay = models.FloatField(default=5)

    # Position de la caméra par défaut pour le preset
    camera_x = models.FloatField(default=0)
    camera_y = models.FloatField(default=6.84)
    camera_z = models.FloatField(default=18.79)
    camera_target_x = models.FloatField(default=0)
    camera_target_y = models.FloatField(default=0)
    camera_target_z = models.FloatField(default=0)

    # Oscillation verticale des autres planètes quand une planète est sélectionnée (sinus)
    oscillation_amplitude = models.FloatField(default=0.3, help_text="Amplitude (unités) du mouvement vertical")
    oscillation_frequency = models.FloatField(default=0.5, help_text="Fréquence (Hz) de l'oscillation")

    class Meta:
        verbose_name = "Preset Explore 3D"
        verbose_name_plural = "Presets Explore 3D"
    def __str__(self): return self.name

class SiteConfiguration(models.Model):
    site_name = models.CharField(max_length=255, blank=True)
    hero_title = models.CharField(max_length=255, blank=True, default="Capital of Fusion")
    hero_subtitle = models.TextField(blank=True)
    
    # Nouveaux champs pour la personnalisation de la Homepage
    hero_top_text = models.CharField(max_length=255, blank=True, default="Nouvelle Version Immersive")
    hero_descr_1 = models.TextField(blank=True, default="Découvrez l'univers de la Bachata comme jamais.")
    hero_descr_2 = models.TextField(blank=True, default="Une expérience interactive en 3D au cœur de la danse.")
    hero_btn_1_text = models.CharField(max_length=100, blank=True, default="Commencer l'Expérience")
    hero_btn_1_url = models.CharField(max_length=255, blank=True, default="/explore")
    hero_btn_2_text = models.CharField(max_length=100, blank=True, default="Voir les Cours")
    hero_btn_2_url = models.CharField(max_length=255, blank=True, default="/cours")
    hero_footer_text = models.CharField(max_length=255, blank=True, default="Paris, France • École Nationale de Danse")

    # Identité COF — Notre vision (page markdown)
    vision_markdown = models.TextField(
        blank=True,
        default="",
        verbose_name="Notre vision (Markdown)",
        help_text="Contenu de la page Identité COF → Notre vision (format Markdown).",
    )

    active_explore_preset = models.ForeignKey(ExplorePreset, on_delete=models.SET_NULL, null=True, blank=True)
    VIDEO_CHOICES = (('youtube', 'Vidéo YouTube'), ('mp4', 'Fichier Local (MP4)'))
    main_video_type = models.CharField(max_length=10, choices=VIDEO_CHOICES, default='youtube')
    main_video_youtube_id = models.CharField(max_length=50, blank=True, default="Dqg0oKlXpTE")
    main_video_file = models.FileField(upload_to='videos/', blank=True, null=True)
    cycle_video_type = models.CharField(max_length=10, choices=VIDEO_CHOICES, default='youtube')
    cycle_video_youtube_id = models.CharField(max_length=50, blank=True, default="eZhq_RMYRKQ")
    cycle_video_file = models.FileField(upload_to='videos/', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


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


class Bulletin(BaseModel):
    """
    Bulletin d'information (Identité COF → Bulletins), affichés en ordre chronologique.
    Contenu au format Markdown.
    """
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    content_markdown = models.TextField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Bulletin d'information"
        verbose_name_plural = "Bulletins d'information"
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title


class PendingContentEdit(models.Model):
    """
    Demande de modification de contenu par un staff, en attente d'approbation admin.
    Les admins appliquent directement ; les staff créent une demande que l'admin doit approuver.
    """
    class ContentType(models.TextChoices):
        SITECONFIG = "siteconfig", "Configuration (Notre vision)"
        BULLETIN = "bulletin", "Bulletin"
        EVENT = "event", "Événement"
        COURSE = "course", "Cours"
        THEORY_LESSON = "theory_lesson", "Leçon de théorie"
        ORGANIZATION_NODE = "organization_node", "Noeud organisation"
        PROJECT = "project", "Projet"

    class Status(models.TextChoices):
        PENDING = "PENDING", "En attente"
        APPROVED = "APPROVED", "Approuvé"
        REJECTED = "REJECTED", "Refusé"

    content_type = models.CharField(max_length=32, choices=ContentType.choices)
    object_id = models.CharField(max_length=255, blank=True, help_text="Slug ou id de l'objet (vide pour siteconfig)")
    payload = models.JSONField(default=dict, help_text="Champs proposés (partial update)")
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pending_content_edits",
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_content_edits",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Modification en attente"
        verbose_name_plural = "Modifications en attente"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_content_type_display()} ({self.object_id or 'config'}) — {self.get_status_display()}"
