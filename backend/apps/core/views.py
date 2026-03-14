"""
Vues API Core — menu (items racine avec children récursifs), health check.
"""
from django.http import JsonResponse
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MenuItem, SiteConfiguration, ExplorePreset, Bulletin, PendingContentEdit
from .serializers import (
    MenuItemSerializer,
    SiteConfigurationSerializer,
    ExplorePresetSerializer,
    BulletinSerializer,
    BulletinAdminSerializer,
    PendingContentEditSerializer,
)
from .permissions import IsStaffOrSuperUser, IsSuperUser
from .pending_edits import apply_pending_edit

class SiteConfigurationAPIView(APIView):
    """GET /api/config/ — lecture publique de la configuration."""
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


class BulletinListAPIView(APIView):
    """
    GET /api/identite/bulletins/
    Liste des bulletins publiés, ordre chronologique inverse (plus récent en premier).
    """
    def get(self, request):
        qs = Bulletin.objects.filter(is_published=True).order_by("-published_at", "-created_at")
        serializer = BulletinSerializer(qs, many=True)
        return Response(serializer.data)


class BulletinDetailAPIView(APIView):
    """
    GET /api/identite/bulletins/<slug>/
    Détail d'un bulletin par slug (publiés uniquement).
    """
    def get(self, request, slug):
        bulletin = get_object_or_404(Bulletin, slug=slug, is_published=True)
        serializer = BulletinSerializer(bulletin)
        return Response(serializer.data)


class SiteConfigurationAdminAPIView(APIView):
    """PATCH /api/admin/config/ — vision_markdown, history_markdown. Admin : appliqué direct. Staff : demande en attente."""
    permission_classes = [IsStaffOrSuperUser]

    def patch(self, request):
        config = SiteConfiguration.objects.first()
        if not config:
            config = SiteConfiguration.objects.create()
        payload = {}
        if request.data.get("vision_markdown") is not None:
            payload["vision_markdown"] = request.data["vision_markdown"]
        if request.data.get("history_markdown") is not None:
            payload["history_markdown"] = request.data["history_markdown"]
        if not payload:
            serializer = SiteConfigurationSerializer(config, context={'request': request})
            return Response(serializer.data)
        if getattr(request.user, "is_superuser", False):
            for key, value in payload.items():
                setattr(config, key, value)
            config.save(update_fields=list(payload.keys()) + ["updated_at"])
            serializer = SiteConfigurationSerializer(config, context={'request': request})
            return Response(serializer.data)
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.SITECONFIG,
            object_id="",
            payload=payload,
            requested_by=request.user,
        )
        return Response(
            {"message": "Modification enregistrée. Elle sera visible après approbation par un administrateur.", "pending": True},
            status=status.HTTP_202_ACCEPTED,
        )


class BulletinAdminListCreateAPIView(APIView):
    """
    GET /api/admin/identite/bulletins/ — liste tous les bulletins (dont brouillons) pour staff.
    POST /api/admin/identite/bulletins/ — création (staff/superuser).
    """
    permission_classes = [IsStaffOrSuperUser]

    def get(self, request):
        qs = Bulletin.objects.all().order_by("-published_at", "-created_at")
        serializer = BulletinAdminSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BulletinAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BulletinAdminDetailAPIView(APIView):
    """
    GET/PATCH /api/admin/identite/bulletins/<slug>/ — détail et mise à jour (staff/superuser).
    Retourne aussi les bulletins non publiés.
    """
    permission_classes = [IsStaffOrSuperUser]

    def get(self, request, slug):
        bulletin = get_object_or_404(Bulletin, slug=slug)
        serializer = BulletinAdminSerializer(bulletin)
        return Response(serializer.data)

    def patch(self, request, slug):
        bulletin = get_object_or_404(Bulletin, slug=slug)
        if getattr(request.user, "is_superuser", False):
            serializer = BulletinAdminSerializer(bulletin, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = BulletinAdminSerializer(bulletin, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.BULLETIN,
            object_id=slug,
            payload=payload,
            requested_by=request.user,
        )
        return Response(
            {"message": "Modification enregistrée. Elle sera visible après approbation par un administrateur.", "pending": True},
            status=status.HTTP_202_ACCEPTED,
        )


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
    permission_classes = []


class PendingContentEditListAPIView(APIView):
    """
    GET /api/admin/pending-edits/ — liste des modifications en attente.
    Admin : toutes les demandes PENDING. Staff : uniquement les siennes.
    """
    permission_classes = [IsStaffOrSuperUser]

    def get(self, request):
        qs = PendingContentEdit.objects.filter(status=PendingContentEdit.Status.PENDING)
        if not getattr(request.user, "is_superuser", False):
            qs = qs.filter(requested_by=request.user)
        qs = qs.select_related("requested_by", "reviewed_by").order_by("-created_at")
        serializer = PendingContentEditSerializer(qs, many=True)
        return Response(serializer.data)


class PendingContentEditDetailAPIView(APIView):
    """
    PATCH /api/admin/pending-edits/<id>/ — approuver ou refuser (admin uniquement).
    Body: { "action": "approve" | "reject" }
    """
    permission_classes = [IsSuperUser]

    def patch(self, request, pk):
        edit = get_object_or_404(PendingContentEdit, pk=pk, status=PendingContentEdit.Status.PENDING)
        action = (request.data.get("action") or "").strip().lower()
        if action == "approve":
            try:
                apply_pending_edit(edit)
            except Exception as e:
                return Response(
                    {"error": f"Erreur lors de l'application: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            edit.status = PendingContentEdit.Status.APPROVED
        elif action == "reject":
            edit.status = PendingContentEdit.Status.REJECTED
        else:
            return Response(
                {"error": "action doit être 'approve' ou 'reject'"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        edit.reviewed_by = request.user
        edit.reviewed_at = timezone.now()
        edit.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])
        serializer = PendingContentEditSerializer(edit)
        return Response(serializer.data)
