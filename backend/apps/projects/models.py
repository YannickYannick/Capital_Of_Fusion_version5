from django.db import models
from apps.core.models import BaseModel

class ProjectCategory(BaseModel):
    name = models.CharField(max_length=255, verbose_name="Type de projet", help_text="Ex: Incubation, Initiative")
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, verbose_name="Description")

    class Meta:
        verbose_name = "Catégorie de projet"
        verbose_name_plural = "Catégories de projets"

    def __str__(self):
        return self.name

class Project(BaseModel):
    class ProjectStatus(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", "En cours"
        COMPLETED = "COMPLETED", "Terminé"
        UPCOMING = "UPCOMING", "À venir"

    category = models.ForeignKey(ProjectCategory, on_delete=models.CASCADE, related_name='projects', verbose_name="Catégorie")
    title = models.CharField(max_length=255, verbose_name="Titre du projet")
    slug = models.SlugField(max_length=255, unique=True)
    summary = models.CharField(max_length=500, blank=True, verbose_name="Résumé court")
    content = models.TextField(blank=True, verbose_name="Contenu riche")
    cover_image = models.ImageField(upload_to='projects/covers/', blank=True, null=True, verbose_name="Image de couverture")
    start_date = models.DateField(blank=True, null=True, verbose_name="Date de début")
    status = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.IN_PROGRESS, verbose_name="Statut")

    class Meta:
        verbose_name = "Projet"
        verbose_name_plural = "Projets"

    def __str__(self):
        return self.title
