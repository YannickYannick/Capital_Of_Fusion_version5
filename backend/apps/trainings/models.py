from django.db import models
from apps.core.models import BaseModel

class SubscriptionPass(BaseModel):
    name = models.CharField(max_length=255, verbose_name="Nom du Pass", help_text="Ex: Adhésion annuelle, Pass 10 Sessions")
    description = models.TextField(blank=True, verbose_name="Description")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix (€)")
    validity_months = models.PositiveIntegerField(default=12, verbose_name="Durée de validité (mois)")
    stripe_payment_url = models.URLField(blank=True, verbose_name="Lien de paiement Stripe")

    class Meta:
        verbose_name = "Pass / Abonnement"
        verbose_name_plural = "Pass & Abonnements"

    def __str__(self):
        return self.name

class TrainingSession(BaseModel):
    date = models.DateTimeField(verbose_name="Date et heure de la session")
    location = models.CharField(max_length=255, verbose_name="Lieu")
    theme = models.CharField(max_length=255, blank=True, verbose_name="Thématique")
    available_spots = models.PositiveIntegerField(verbose_name="Places disponibles")
    is_active = models.BooleanField(default=True, verbose_name="Session active")

    class Meta:
        verbose_name = "Session de training"
        verbose_name_plural = "Sessions de training"

    def __str__(self):
        return f"Session du {self.date.strftime('%d/%m/%Y %H:%M')} - {self.theme or 'Libre'}"
