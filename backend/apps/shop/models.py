from django.db import models
from apps.core.models import BaseModel

class ProductCategory(BaseModel):
    name = models.CharField(max_length=255, verbose_name="Nom de la catégorie")
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, verbose_name="Description")

    class Meta:
        verbose_name = "Catégorie de produit"
        verbose_name_plural = "Catégories de produits"

    def __str__(self):
        return self.name

class Product(BaseModel):
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE, related_name='products', verbose_name="Catégorie")
    name = models.CharField(max_length=255, verbose_name="Nom du produit")
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, verbose_name="Description")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix (€)")
    image = models.ImageField(upload_to='shop/products/', blank=True, null=True, verbose_name="Image du produit")
    in_stock = models.BooleanField(default=True, verbose_name="En stock")
    stripe_payment_url = models.URLField(blank=True, verbose_name="Lien de paiement Stripe")

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"

    def __str__(self):
        return self.name
