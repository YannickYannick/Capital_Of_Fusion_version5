"""
Views Projects — Catégories et projets.
"""
from rest_framework import viewsets, permissions
from .models import ProjectCategory, Project
from .serializers import ProjectCategorySerializer, ProjectSerializer


class ProjectCategoryViewSet(viewsets.ModelViewSet):
    """
    API pour les catégories de projets.
    GET: public, POST/PUT/DELETE: admin.
    """
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class ProjectViewSet(viewsets.ModelViewSet):
    """
    API pour les projets.
    GET: public, POST/PUT/DELETE: admin.
    Filtres: ?status=IN_PROGRESS, ?category=id
    """
    serializer_class = ProjectSerializer
    lookup_field = "slug"

    def get_queryset(self):
        qs = Project.objects.select_related("category")
        
        # Filtre par statut
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        
        # Filtre par catégorie
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category_id=category)
        
        return qs

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
