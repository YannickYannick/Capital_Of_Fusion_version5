from rest_framework import viewsets, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import ProjectCategory, Project
from .serializers import ProjectCategorySerializer, ProjectSerializer


def _require_admin(user):
    return user.is_authenticated and user.is_superuser


class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/projects/categories/ — liste des catégories de projets.
    GET /api/projects/categories/<pk>/ — détail.
    """
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class ProjectViewSet(viewsets.ModelViewSet):
    """
    GET /api/projects/projects/ — liste des projets.
    GET /api/projects/projects/<slug>/ — détail.
    POST/PATCH/DELETE sécurisés admin.
    """
    queryset = Project.objects.all().select_related("category").order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def _check_admin(self, request):
        if not _require_admin(request.user):
            return Response(
                {"error": "Réservé aux administrateurs."},
                status=status.HTTP_403_FORBIDDEN
            )
        return None

    def create(self, request, *args, **kwargs):
        err = self._check_admin(request)
        if err:
            return err
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        err = self._check_admin(request)
        if err:
            return err
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        err = self._check_admin(request)
        if err:
            return err
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        err = self._check_admin(request)
        if err:
            return err
        return super().destroy(request, *args, **kwargs)
