"""
Serializers Shop — Catégories et produits.
"""
from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de produits."""
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id", "name", "slug", "description", "icon", "image",
            "order", "is_active", "products_count", "created_at", "updated_at"
        ]

    def get_products_count(self, obj):
        return obj.products.filter(is_available=True).count()


class ProductSerializer(serializers.ModelSerializer):
    """Serializer pour les produits."""
    category_name = serializers.ReadOnlyField(source="category.name")
    category_slug = serializers.ReadOnlyField(source="category.slug")
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id", "category", "category_name", "category_slug",
            "name", "slug", "description", "short_description",
            "price", "compare_price", "image", "images", "sizes", "colors",
            "stock", "is_available", "is_featured", "in_stock", "order",
            "created_at", "updated_at"
        ]


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer allégé pour les listes de produits."""
    category_name = serializers.ReadOnlyField(source="category.name")
    category_slug = serializers.ReadOnlyField(source="category.slug")
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id", "category_name", "category_slug", "name", "slug",
            "short_description", "price", "compare_price", "image",
            "is_available", "is_featured", "in_stock"
        ]
