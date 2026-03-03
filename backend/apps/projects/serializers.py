from rest_framework import serializers
from .models import ProjectCategory, Project

class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ['id', 'name', 'slug', 'description']

class ProjectSerializer(serializers.ModelSerializer):
    category = ProjectCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectCategory.objects.all(), source='category', write_only=True
    )

    class Meta:
        model = Project
        fields = ['id', 'category', 'category_id', 'title', 'slug', 'summary', 
                  'content', 'cover_image', 'start_date', 'status']
