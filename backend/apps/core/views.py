"""
Vues API Core — menu (items racine avec children récursifs), health check.
"""
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MenuItem
from .serializers import MenuItemSerializer


def health_check(request):
    """
    GET /api/health/ — ne touche pas à la DB. Pour vérifier que Django répond (diagnostic déploiement).
    """
    return JsonResponse({"status": "ok"})


class MenuItemListAPIView(APIView):
    """
    GET /api/menu/items/
    Liste des MenuItem racine (parent=None), avec enfants récursifs. Ordre par order.
    """

    def get(self, request):
        items = MenuItem.objects.filter(parent=None, is_active=True).order_by("order")
        serializer = MenuItemSerializer(items, many=True)
        return Response(serializer.data)
