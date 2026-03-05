from django.db import models
from apps.core.models import BaseModel

class Artist(BaseModel):
    user = models.OneToOneField("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="artist_profile")
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to="artists/", blank=True, null=True)
    styles = models.ManyToManyField("core.DanceStyle", related_name="artists", blank=True)
    website = models.URLField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    is_visible = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Artiste"
        verbose_name_plural = "Artistes"

    def __str__(self):
        return self.name

class ArtistBooking(BaseModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "En attente"
        APPROVED = "APPROVED", "Approuvée"
        REJECTED = "REJECTED", "Refusée"

    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="bookings")
    requester = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="requested_bookings")
    event_name = models.CharField(max_length=255)
    requested_date = models.DateField()
    location = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    class Meta:
        verbose_name = "Réservation Artiste"
        verbose_name_plural = "Réservations Artistes"

class ArtistReview(BaseModel):
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="artist_reviews")
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField(blank=True)

    class Meta:
        verbose_name = "Avis Artiste"
        verbose_name_plural = "Avis Artistes"
        unique_together = ("artist", "user")
