"""
Vues API Core — menu (items racine avec children récursifs), health check.
"""
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MenuItem, SiteConfiguration, ExplorePreset
from .serializers import MenuItemSerializer, SiteConfigurationSerializer, ExplorePresetSerializer

class SiteConfigurationAPIView(APIView):
    """
    GET /api/config/
    Retourne la configuration singleton du site.
    """
    def get(self, request):
        config = SiteConfiguration.objects.first()
        if not config:
            config = SiteConfiguration.objects.create()
        serializer = SiteConfigurationSerializer(config, context={'request': request})
        return Response(serializer.data)


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


def seed_database(request):
    """
    POST /api/seed/?key=SECRET_KEY
    Endpoint sécurisé pour initialiser la base de données (noeuds + superuser).
    """
    import json
    secret = request.GET.get("key", "")
    expected = getattr(settings, 'SEED_SECRET_KEY', 'change-me-in-prod')
    if secret != expected:
        return JsonResponse({"error": "Unauthorized"}, status=403)

    results = {}

    # 1. Seed organization nodes
    try:
        from django.core.management import call_command
        from io import StringIO
        out = StringIO()
        call_command('load_initial_data', stdout=out)
        call_command('load_demo_data', stdout=out)
        results['seed_data'] = out.getvalue().strip()
    except Exception as e:
        results['seed_data'] = f"Error: {str(e)}"

    # 2. Create admin superuser
    try:
        call_command('create_admin', stdout=out)
        results['create_admin'] = out.getvalue().strip()
    except Exception as e:
        results['create_admin'] = f"Error: {str(e)}"

    return JsonResponse({"status": "done", "results": results})


class ExplorePresetViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les presets Explore 3D.
    """
    queryset = ExplorePreset.objects.all().order_by("-created_at")
    serializer_class = ExplorePresetSerializer
    permission_classes = [] # On laisse ouvert pour l'instant ou on pourra restreindre plus tard
