from django.db import models
from apps.core.models import BaseModel

class SubscriptionPass(BaseModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    validity_months = models.PositiveIntegerField(default=1)
    stripe_payment_url = models.URLField(max_length=500, blank=True)

    class Meta:
        verbose_name_plural = "Subscription passes"

    def __str__(self):
        return self.name

class TrainingSession(BaseModel):
    theme = models.CharField(max_length=255)
    date = models.DateTimeField()
    location = models.CharField(max_length=255)
    available_spots = models.PositiveIntegerField(default=20)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.theme
