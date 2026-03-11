"""
Modèles Shop — Catégories et produits de la boutique.
Héritent de BaseModel (UUID, created_at, updated_at).
"""
from django.db import models
from apps.core.models import BaseModel


class Category(BaseModel):
    """
    Catégorie de produits (T-shirts, Pulls, Chaussures, Vins, etc.).
    """
    name = models.CharField(max_length=100, verbose_name="Nom")
    slug = models.SlugField(unique=True, max_length=100)
    description = models.TextField(blank=True, verbose_name="Description")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Icône (emoji)")
    image = models.ImageField(upload_to="shop/categories/", blank=True, null=True, verbose_name="Image")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")
    is_active = models.BooleanField(default=True, verbose_name="Active")

    class Meta:
        verbose_name = "Catégorie produit"
        verbose_name_plural = "Catégories produits"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Product(BaseModel):
    """
    Produit de la boutique Capital of Fusion.
    """
    category = models.ForeignKey(
        Category,
        related_name="products",
        on_delete=models.CASCADE,
        verbose_name="Catégorie"
    )
    name = models.CharField(max_length=255, verbose_name="Nom")
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField(verbose_name="Description")
    short_description = models.CharField(max_length=255, blank=True, verbose_name="Description courte")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix (€)")
    compare_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Prix barré")
    image = models.ImageField(upload_to="shop/products/", blank=True, null=True, verbose_name="Image principale")
    images = models.JSONField(default=list, blank=True, verbose_name="Images additionnelles", help_text="Liste d'URLs d'images")
    sizes = models.JSONField(default=list, blank=True, verbose_name="Tailles disponibles", help_text="Ex: ['S', 'M', 'L', 'XL']")
    colors = models.JSONField(default=list, blank=True, verbose_name="Couleurs disponibles")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock")
    is_available = models.BooleanField(default=True, verbose_name="Disponible")
    is_featured = models.BooleanField(default=False, verbose_name="Mis en avant")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0 and self.is_available
