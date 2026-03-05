from rest_framework import serializers
from .models import Project, ProjectCategory

class ProjectCategorySerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField()
    class Meta:
        model = ProjectCategory
        fields = ['id', 'title', 'name', 'description']

class ProjectSerializer(serializers.ModelSerializer):
    category = ProjectCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectCategory.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'category', 'category_id', 
            'status', 'summary', 'content', 'start_date', 'cover_image',
            'created_at', 'updated_at'
        ]
