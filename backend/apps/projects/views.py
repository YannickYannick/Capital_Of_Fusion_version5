from rest_framework import viewsets
from .models import ProjectCategory, Project
from .serializers import ProjectCategorySerializer, ProjectSerializer

class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    lookup_field = 'slug'

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'slug'
