from rest_framework import serializers
from .models import ProjectCategory, Project

class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.title')
    class Meta:
        model = Project
        fields = '__all__'
