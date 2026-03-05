from rest_framework import serializers
from .models import ProductCategory, Product

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug', 'description']

class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductCategory.objects.all(),
        source='category',
        write_only=True,
        required=True
    )

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'name', 'slug',
            'description', 'price', 'image', 'in_stock',
            'stripe_payment_url'
        ]
