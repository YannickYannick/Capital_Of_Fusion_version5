"""
Serializers Core — MenuItem récursif (parent → children) pour l’API menu.
"""
from rest_framework import serializers
from .models import MenuItem, SiteConfiguration, ExplorePreset

class ExplorePresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExplorePreset
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        new_data = {}
        for key, value in data.items():
            # Conversion snake_case -> camelCase pour le frontend
            parts = key.split('_')
            camel_key = parts[0] + ''.join(x.title() for x in parts[1:])
            new_data[camel_key] = value
        return new_data

class SiteConfigurationSerializer(serializers.ModelSerializer):
    explore_config = serializers.SerializerMethodField()
    class Meta:
        model = SiteConfiguration
        fields = ["site_name", "hero_title", "hero_subtitle", "main_video_type", "main_video_youtube_id", "main_video_file", "cycle_video_type", "cycle_video_youtube_id", "cycle_video_file", "explore_config"]
    def get_explore_config(self, obj):
        return ExplorePresetSerializer(obj.active_explore_preset).data if obj.active_explore_preset else None


class MenuItemSerializer(serializers.ModelSerializer):
    """
    Serializer récursif : chaque item expose ses children (sous-items).
    Utilisé pour GET /api/menu/items/ (racine parent=None).
    """

    children = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = ("id", "name", "slug", "url", "icon", "order", "is_active", "children")

    def get_children(self, obj):
        """Enfants actifs, triés par order."""
        children = obj.children.filter(is_active=True).order_by("order")
        return MenuItemSerializer(children, many=True).data
