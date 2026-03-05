from django.db import models
from apps.core.models import BaseModel

class Practitioner(BaseModel):
    name = models.CharField(max_length=200)
    specialty = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    profile_image = models.URLField(max_length=500, blank=True, null=True)
    booking_url = models.URLField(max_length=500, blank=True)

    def __str__(self):
        return self.name

class CareService(BaseModel):
    practitioner = models.ForeignKey(Practitioner, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=60)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return self.name
