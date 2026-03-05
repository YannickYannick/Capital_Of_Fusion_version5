from rest_framework import serializers
from .models import Project, ProjectCategory

class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ['id', 'name', 'slug', 'description']

class ProjectSerializer(serializers.ModelSerializer):
    category = ProjectCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectCategory.objects.all(),
        source='category',
        write_only=True,
        allow_null=True,
        required=False
    )
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'category', 'category_id', 
            'status', 'summary', 'content', 'start_date', 'cover_image',
            'created_at', 'updated_at'
        ]
