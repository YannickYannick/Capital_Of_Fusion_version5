"""
Views Shop — Catégories et produits.
"""
from rest_framework import viewsets, permissions
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductListSerializer


class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    API pour les catégories de produits.
    GET: public, POST/PUT/DELETE: admin.
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class ProductViewSet(viewsets.ModelViewSet):
    """
    API pour les produits.
    GET: public, POST/PUT/DELETE: admin.
    Filtres: ?category=slug, ?featured=1, ?available=1
    """
    lookup_field = "slug"

    def get_queryset(self):
        qs = Product.objects.select_related("category")
        
        # Filtre par catégorie
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__slug=category)
        
        # Filtre produits mis en avant
        if self.request.query_params.get("featured"):
            qs = qs.filter(is_featured=True)
        
        # Filtre produits disponibles (par défaut)
        if self.request.query_params.get("available", "1") == "1":
            qs = qs.filter(is_available=True)
        
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
