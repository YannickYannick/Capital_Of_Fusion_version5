"""
Modèles Organization — OrganizationNode (récursif + 3D), OrganizationRole,
UserOrganizationRole, NodeEvent. Alignés MCD Phase 1 section 1.3.
"""
from django.db import models
from apps.core.models import BaseModel


class OrganizationNode(BaseModel):
    """
    Noeud d'organisation récursif (ex. BachataVibe Paris ⊂ Capital of Fusion).
    Champs texte + paramètres 3D (orbit, planet, entry).
    """

    class NodeType(models.TextChoices):
        ROOT = "ROOT", "Racine"
        BRANCH = "BRANCH", "Branche"
        EVENT = "EVENT", "Événement"

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    type = models.CharField(max_length=20, choices=NodeType.choices, default=NodeType.BRANCH)
    video_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="organization/", null=True, blank=True)
    short_description = models.CharField(max_length=500, blank=True)
    content = models.TextField(blank=True)
    cta_text = models.CharField(max_length=255, blank=True)
    cta_url = models.CharField(max_length=500, blank=True)
    # 3D / visual
    visual_source = models.CharField(max_length=100, blank=True)
    planet_type = models.CharField(max_length=100, blank=True)
    model_3d = models.CharField(max_length=255, blank=True)
    planet_texture = models.CharField(max_length=255, blank=True)
    planet_color = models.CharField(max_length=50, blank=True)
    orbit_radius = models.FloatField(null=True, blank=True)
    orbit_speed = models.FloatField(null=True, blank=True)
    planet_scale = models.FloatField(null=True, blank=True)
    rotation_speed = models.FloatField(null=True, blank=True)
    orbit_phase = models.FloatField(null=True, blank=True)
    orbit_shape = models.CharField(max_length=50, blank=True)
    orbit_roundness = models.FloatField(null=True, blank=True)
    entry_start_x = models.FloatField(null=True, blank=True)
    entry_start_y = models.FloatField(null=True, blank=True)
    entry_start_z = models.FloatField(null=True, blank=True)
    entry_speed = models.FloatField(null=True, blank=True)
    is_visible_3d = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Noeud d'organisation"
        verbose_name_plural = "Noeuds d'organisation"

    def __str__(self):
        return self.name


class OrganizationRole(BaseModel):
    """Rôle dans l'organisation (participant, artiste, admin…)."""

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Rôle organisation"
        verbose_name_plural = "Rôles organisation"

    def __str__(self):
        return self.name


class UserOrganizationRole(BaseModel):
    """Association User – Node – Role (M-N avec attributs)."""

    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="organization_roles"
    )
    node = models.ForeignKey(
        OrganizationNode, on_delete=models.CASCADE, related_name="user_roles"
    )
    role = models.ForeignKey(
        OrganizationRole, on_delete=models.CASCADE, related_name="user_assignments"
    )

    class Meta:
        verbose_name = "Rôle utilisateur sur un noeud"
        verbose_name_plural = "Rôles utilisateurs sur noeuds"
        unique_together = [("user", "node", "role")]

    def __str__(self):
        return f"{self.user} - {self.node} ({self.role})"


class NodeEvent(BaseModel):
    """Événement affiché dans l'overlay d'un noeud."""

    node = models.ForeignKey(
        OrganizationNode, on_delete=models.CASCADE, related_name="node_events"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="node_events/", null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    external_url = models.URLField(blank=True)

    class Meta:
        verbose_name = "Événement noeud"
        verbose_name_plural = "Événements noeud"

    def __str__(self):
        return self.title
