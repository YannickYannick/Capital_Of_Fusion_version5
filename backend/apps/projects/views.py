from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from apps.core.permissions import IsSuperUser
from .models import Project, ProjectCategory
from .serializers import ProjectSerializer, ProjectCategorySerializer

class BaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet de base qui permet la lecture à tout le monde
    mais réserve l'écriture aux super-utilisateurs.
    """
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperUser()]
        return []

class ProjectCategoryViewSet(BaseViewSet):
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    lookup_field = 'slug'

class ProjectViewSet(BaseViewSet):
    queryset = Project.objects.select_related('category')
    serializer_class = ProjectSerializer
    lookup_field = 'slug'
