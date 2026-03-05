from django.db import models
from apps.core.models import BaseModel
import uuid

class ProjectCategory(BaseModel):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    @property
    def name(self):
        return self.title

    def __str__(self):
        return self.title

class Project(BaseModel):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'En cours'),
        ('UPCOMING', 'À venir'),
        ('COMPLETED', 'Terminé'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(ProjectCategory, related_name='projects', on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    summary = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True) # Fallback for some views
    cover_image = models.ImageField(upload_to='projects/', blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
