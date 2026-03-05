from django.urls import path
from rest_framework import routers
from .views import ArtistViewSet, ArtistBookingViewSet, ArtistReviewViewSet

router = routers.DefaultRouter()
router.register(r"annuaire", ArtistViewSet, basename="artist")
router.register(r"bookings", ArtistBookingViewSet, basename="artist-booking")
router.register(r"reviews", ArtistReviewViewSet, basename="artist-review")

urlpatterns = router.urls
