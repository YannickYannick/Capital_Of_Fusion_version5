from django.db import models


class ProjectCategory(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Catégorie de Projet"
        verbose_name_plural = "Catégories de Projets"

    def __str__(self):
        return self.name


class Project(models.Model):
    STATUS_CHOICES = [
        ("IN_PROGRESS", "En cours"),
        ("COMPLETED", "Terminé"),
        ("UPCOMING", "À venir"),
    ]

    category = models.ForeignKey(
        ProjectCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="projects"
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="projects/covers/", null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="UPCOMING")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Projet"
        verbose_name_plural = "Projets"

    def __str__(self):
        return self.title
