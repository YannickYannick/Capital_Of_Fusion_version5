"""
Serializers Core — MenuItem récursif (parent → children) pour l’API menu.
"""
from rest_framework import serializers
from .models import MenuItem, SiteConfiguration

class SiteConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfiguration
        fields = [
            "site_name", "hero_title", "hero_subtitle",
            "main_video_type", "main_video_youtube_id", "main_video_file",
            "cycle_video_type", "cycle_video_youtube_id", "cycle_video_file",
        ]


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
