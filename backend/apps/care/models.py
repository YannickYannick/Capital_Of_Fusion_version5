"""
Modèles Care — Praticiens et services de bien-être.
Héritent de BaseModel (UUID, created_at, updated_at).
"""
from django.db import models
from apps.core.models import BaseModel


class Practitioner(BaseModel):
    """
    Praticien / thérapeute proposant des soins (massages, ostéo, etc.).
    """
    name = models.CharField(max_length=255, verbose_name="Nom")
    slug = models.SlugField(unique=True, max_length=255)
    specialty = models.CharField(max_length=100, verbose_name="Spécialité")
    bio = models.TextField(verbose_name="Biographie")
    short_bio = models.CharField(max_length=255, blank=True, verbose_name="Bio courte")
    profile_image = models.ImageField(upload_to="care/practitioners/", blank=True, null=True, verbose_name="Photo")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, verbose_name="Email")
    website = models.URLField(blank=True, verbose_name="Site web")
    booking_url = models.URLField(blank=True, verbose_name="Lien de réservation")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")

    class Meta:
        verbose_name = "Praticien"
        verbose_name_plural = "Praticiens"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class ServiceCategory(BaseModel):
    """
    Catégorie de soins (Massage, Ostéopathie, Kinésithérapie, etc.).
    """
    name = models.CharField(max_length=100, verbose_name="Nom")
    slug = models.SlugField(unique=True, max_length=100)
    description = models.TextField(blank=True, verbose_name="Description")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Icône (emoji)")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")

    class Meta:
        verbose_name = "Catégorie de soin"
        verbose_name_plural = "Catégories de soins"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Service(BaseModel):
    """
    Prestation / soin proposé par un praticien.
    """
    practitioner = models.ForeignKey(
        Practitioner,
        related_name="services",
        on_delete=models.CASCADE,
        verbose_name="Praticien"
    )
    category = models.ForeignKey(
        ServiceCategory,
        related_name="services",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Catégorie"
    )
    title = models.CharField(max_length=255, verbose_name="Titre")
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField(verbose_name="Description")
    short_description = models.CharField(max_length=255, blank=True, verbose_name="Description courte")
    duration_minutes = models.PositiveIntegerField(verbose_name="Durée (minutes)")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix (€)")
    image = models.ImageField(upload_to="care/services/", blank=True, null=True, verbose_name="Image")
    is_available = models.BooleanField(default=True, verbose_name="Disponible")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")

    class Meta:
        verbose_name = "Soin"
        verbose_name_plural = "Soins"
        ordering = ["order", "title"]

    def __str__(self):
        return f"{self.title} - {self.practitioner.name}"
