from rest_framework import viewsets
from apps.core.permissions import IsSuperUser
from .models import ProductCategory, Product
from .serializers import ProductCategorySerializer, ProductSerializer

class BaseViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperUser()]
        return []

class ProductCategoryViewSet(BaseViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    lookup_field = 'slug'

class ProductViewSet(BaseViewSet):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductSerializer
    lookup_field = 'slug'
