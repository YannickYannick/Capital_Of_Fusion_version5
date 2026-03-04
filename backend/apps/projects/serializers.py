from rest_framework import serializers
from .models import ProjectCategory, Project


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ["id", "name", "slug", "description"]


class ProjectSerializer(serializers.ModelSerializer):
    category = ProjectCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectCategory.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "category", "category_id", "title", "slug", "summary",
            "content", "cover_image", "start_date", "status",
        ]

    def get_cover_image(self, obj):
        if obj.cover_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None
