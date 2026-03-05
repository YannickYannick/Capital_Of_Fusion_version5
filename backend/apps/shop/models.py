from django.db import models
from apps.core.models import BaseModel

class ProductCategory(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Product categories"

    def __str__(self):
        return self.name

class Product(BaseModel):
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.URLField(max_length=500, blank=True, null=True)
    in_stock = models.BooleanField(default=True)
    stripe_payment_url = models.URLField(max_length=500, blank=True)

    def __str__(self):
        return self.name
