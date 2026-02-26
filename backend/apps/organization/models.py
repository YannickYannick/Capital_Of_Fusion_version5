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
    # Champs pour l'overlay central
    cover_image = models.ImageField(
        upload_to='nodes/covers/',
        blank=True,
        null=True,
        verbose_name="Image de couverture",
        help_text="Image principale affichée dans l'overlay (format 16:9 recommandé)"
    )
    short_description = models.CharField(
        max_length=300,
        blank=True,
        verbose_name="Accroche courte",
        help_text="Description courte affichée sous le titre (max 300 caractères)"
    )
    content = models.TextField(
        blank=True,
        verbose_name="Contenu détaillé",
        help_text="Contenu riche affiché dans l'overlay (supporte le markdown)"
    )
    cta_text = models.CharField(
        max_length=50,
        blank=True,
        default="En savoir plus",
        verbose_name="Texte du bouton CTA",
        help_text="Texte du bouton d'action principal"
    )
    cta_url = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="URL du bouton CTA",
        help_text="Lien vers la page de destination (ex: /cours)"
    )
    
    # Configuration 3D pour la visualisation planétaire
    VISUAL_SOURCES = (
        ('preset', 'Préglage (Planet Type)'),
        ('glb', 'Fichier GLB'),
        ('gif', 'Fichier GIF / Image'),
    )
    visual_source = models.CharField(
        max_length=10,
        choices=VISUAL_SOURCES,
        default='preset',
        help_text="Choisissez la source du visuel : un préglage paramétrique ou un fichier"
    )

    PLANET_TYPES = (
        ('wire', 'Wireframe'),
        ('dotted', 'Dotted'),
        ('glass', 'Glass'),
        ('chrome', 'Chrome'),
        ('network', 'Network'),
        ('star', 'Starburst'),
    )
    planet_type = models.CharField(
        max_length=20,
        choices=PLANET_TYPES,
        default='glass',
        help_text="Utilisé si la source est 'Préglage'"
    )
    
    # Fichiers pour types personnalisés
    model_3d = models.FileField(
        upload_to='planets/models/',
        blank=True,
        null=True,
        help_text="Utilisé si la source est 'Fichier GLB'"
    )
    planet_texture = models.ImageField(
        upload_to='planets/textures/',
        blank=True,
        null=True,
        help_text="Utilisé si la source est 'Fichier GIF / Image'"
    )

    planet_color = models.CharField(
        max_length=7,
        default='#7c3aed',
        help_text="Couleur de la planète (format hex: #RRGGBB)"
    )
    orbit_radius = models.FloatField(
        default=5.0,
        help_text="Distance du centre (rayon de l'orbite)"
    )
    orbit_speed = models.FloatField(
        default=0.15,
        help_text="Vitesse de rotation orbitale"
    )
    planet_scale = models.FloatField(
        default=0.8,
        help_text="Taille de la planète"
    )
    rotation_speed = models.FloatField(
        default=1.0,
        help_text="Vitesse de rotation sur elle-même"
    )
    orbit_phase = models.FloatField(
        default=0.0,
        help_text="Position initiale sur l'orbite (en radians)"
    )
    orbit_position_y = models.FloatField(
        default=0.0,
        help_text="Position verticale (Y) manuelle de l'orbite (entre -50 et +50)"
    )
    
    ORBIT_SHAPES = (
        ('circle', 'Circulaire'),
        ('squircle', 'Squircle (Carré arrondi)'),
    )
    orbit_shape = models.CharField(
        max_length=10,
        choices=ORBIT_SHAPES,
        default='circle',
        help_text="Forme de l'orbite"
    )
    
    orbit_roundness = models.FloatField(
        default=0.6,
        help_text="Pour Squircle : 0 = carré, 1 = cercle"
    )
    
    # Entry Animation Configuration
    entry_start_x = models.FloatField(
        default=-60.0,
        help_text="Position de départ X (ligne d'entrée)"
    )
    entry_start_y = models.FloatField(
        default=0.0,
        help_text="Position de départ Y (ligne d'entrée)"
    )
    entry_start_z = models.FloatField(
        null=True,
        blank=True,
        help_text="Position de départ Z (si null, utilise orbit_radius)"
    )
    entry_speed = models.FloatField(
        default=0.4,
        help_text="Vitesse de la trajectoire d'entrée"
    )
    
    is_visible_3d = models.BooleanField(
        default=True,
        help_text="Afficher cette planète dans la scène 3D"
    )

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
