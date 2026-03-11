"""
Views Care — Praticiens et services.
"""
from rest_framework import viewsets, permissions
from .models import Practitioner, ServiceCategory, Service
from .serializers import (
    PractitionerSerializer,
    PractitionerListSerializer,
    ServiceCategorySerializer,
    ServiceSerializer,
)


class PractitionerViewSet(viewsets.ModelViewSet):
    """
    API pour les praticiens.
    GET: public, POST/PUT/DELETE: admin.
    """
    lookup_field = "slug"

    def get_queryset(self):
        qs = Practitioner.objects.filter(is_active=True).prefetch_related("services")
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return PractitionerListSerializer
        return PractitionerSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class ServiceCategoryViewSet(viewsets.ModelViewSet):
    """
    API pour les catégories de soins.
    GET: public, POST/PUT/DELETE: admin.
    """
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class CareServiceViewSet(viewsets.ModelViewSet):
    """
    API pour les services/soins.
    GET: public, POST/PUT/DELETE: admin.
    Filtres: ?category=slug, ?practitioner=slug
    """
    lookup_field = "slug"

    def get_queryset(self):
        qs = Service.objects.filter(is_available=True).select_related("practitioner", "category")
        
        # Filtre par catégorie
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__slug=category)
        
        # Filtre par praticien
        practitioner = self.request.query_params.get("practitioner")
        if practitioner:
            qs = qs.filter(practitioner__slug=practitioner)
        
        return qs

    def get_serializer_class(self):
        return ServiceSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
