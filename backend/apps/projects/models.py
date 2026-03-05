from django.db import models
from apps.core.models import BaseModel

class ProjectCategory(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Project(BaseModel):
    STATUS_CHOICES = [
        ("IN_PROGRESS", "En cours"),
        ("UPCOMING", "À venir"),
        ("COMPLETED", "Terminé"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.ForeignKey(ProjectCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="IN_PROGRESS")
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    cover_image = models.URLField(blank=True, max_length=500)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.title
