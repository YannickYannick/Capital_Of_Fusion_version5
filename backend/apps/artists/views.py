from rest_framework import viewsets, permissions
from .models import Artist, ArtistBooking, ArtistReview
from .serializers import ArtistSerializer, ArtistBookingSerializer, ArtistReviewSerializer

class IsAdminOrStaffOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_superuser:
            return True
        return obj.user == request.user

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.filter(is_visible=True)
    serializer_class = ArtistSerializer
    permission_classes = [IsAdminOrStaffOwner]
    lookup_field = "slug"

class ArtistBookingViewSet(viewsets.ModelViewSet):
    queryset = ArtistBooking.objects.all()
    serializer_class = ArtistBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return ArtistBooking.objects.all()
        return ArtistBooking.objects.filter(requester=self.request.user)

class ArtistReviewViewSet(viewsets.ModelViewSet):
    queryset = ArtistReview.objects.all()
    serializer_class = ArtistReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
