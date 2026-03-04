from rest_framework import viewsets
from rest_framework.permissions import AllowAny


class ProductCategoryViewSet(viewsets.GenericViewSet):
    queryset = []
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.GenericViewSet):
    queryset = []
    permission_classes = [AllowAny]
