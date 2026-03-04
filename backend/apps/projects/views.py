from rest_framework import viewsets
from rest_framework.response import Response

class ProjectCategoryViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])

class ProjectViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])
