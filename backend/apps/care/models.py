from django.db import models
from apps.core.models import BaseModel

class Practitioner(BaseModel):
    name = models.CharField(max_length=255, verbose_name="Nom du praticien")
    specialty = models.CharField(max_length=255, verbose_name="Spécialité (ex: Ostéopathie, Massage)")
    bio = models.TextField(blank=True, verbose_name="Biographie courte")
    profile_image = models.ImageField(upload_to='care/practitioners/', blank=True, null=True, verbose_name="Photo de profil")
    booking_url = models.URLField(blank=True, verbose_name="Lien de réservation (Doctolib, etc.)")

    class Meta:
        verbose_name = "Praticien"
        verbose_name_plural = "Praticiens"

    def __str__(self):
        return f"{self.name} - {self.specialty}"

class CareService(BaseModel):
    practitioner = models.ForeignKey(Practitioner, on_delete=models.CASCADE, related_name='services', verbose_name="Praticien associé")
    name = models.CharField(max_length=255, verbose_name="Nom du soin")
    description = models.TextField(blank=True, verbose_name="Description du soin")
    duration_minutes = models.PositiveIntegerField(verbose_name="Durée (minutes)", help_text="Durée du soin en minutes")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix indicatif (€)")

    class Meta:
        verbose_name = "Soin"
        verbose_name_plural = "Soins"

    def __str__(self):
        return f"{self.name} ({self.practitioner.name})"
