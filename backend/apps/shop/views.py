from rest_framework import viewsets
from rest_framework.response import Response

class ProductCategoryViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])

class ProductViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])
