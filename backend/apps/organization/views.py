"""
Vues API Organization — liste des noeuds (Explore 3D) ; détail par slug.
Vues admin — modifier les noeuds d'organisation (staff ou superuser).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.contrib.auth import get_user_model
from django.core.cache import cache
from apps.core.permissions import IsStaffOrSuperUser
from apps.core.views import _user_is_admin_direct
from apps.core.models import PendingContentEdit
from .models import OrganizationNode, Pole
from .serializers import (
    OrganizationNodeSerializer,
    OrganizationNodeLightSerializer,
    PoleSerializer,
    StaffMemberSerializer,
)

User = get_user_model()

# Clés de cache pour l'API nœuds (TTL 10 min, invalidées à chaque save/delete)
NODES_LIGHT_CACHE_KEY = "org_nodes_light"
NODES_STRUCTURE_CACHE_KEY = "org_nodes_structure"
NODES_CACHE_TIMEOUT = 10 * 60  # 10 minutes


def invalidate_nodes_cache():
    """Supprime les caches list nodes (appelé par signal post_save/post_delete)."""
    cache.delete(NODES_LIGHT_CACHE_KEY)
    cache.delete(NODES_STRUCTURE_CACHE_KEY)


class OrganizationNodeListAPIView(APIView):
    """
    GET /api/organization/nodes/
    Par défaut : noeuds visibles en 3D (is_visible_3d=True), avec node_events — cache 10 min.
    GET /api/organization/nodes/?for_structure=1 : tous les noeuds (organigramme), cache 10 min.
    """

    def get(self, request):
        for_structure = request.query_params.get("for_structure") in ("1", "true")
        cache_key = NODES_STRUCTURE_CACHE_KEY if for_structure else NODES_LIGHT_CACHE_KEY

        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        if for_structure:
            qs = (
                OrganizationNode.objects.all()
                .select_related("parent")
                .prefetch_related("node_events")
                .order_by("created_at")
            )
            serializer_class = OrganizationNodeSerializer
        else:
            qs = (
                OrganizationNode.objects.filter(is_visible_3d=True)
                .select_related("parent")
                .prefetch_related("node_events")
                .defer(
                    "description",
                    "content",
                    "cta_text",
                    "cta_url",
                    "video_url",
                    "music_type",
                    "music_youtube_url",
                    "music_file",
                )
                .order_by("created_at")
            )
            serializer_class = OrganizationNodeLightSerializer

        serializer = serializer_class(qs, many=True, context={"request": request})
        data = serializer.data
        cache.set(cache_key, data, NODES_CACHE_TIMEOUT)
        return Response(data)


class PoleListAPIView(APIView):
    """
    GET /api/organization/poles/
    Liste des pôles avec le nombre de membres (utilisateurs staff/admin rattachés).
    """
    def get(self, request):
        qs = Pole.objects.annotate(members_count=Count("members")).order_by("order", "name")
        serializer = PoleSerializer(qs, many=True)
        return Response(serializer.data)


class StaffListAPIView(APIView):
    """
    GET /api/organization/staff/
    Liste des membres du staff (User avec user_type STAFF ou ADMIN).
    Query: ?pole=<slug> pour filtrer par pôle.
    """
    def get(self, request):
        qs = User.objects.filter(
            user_type__in=[User.UserType.STAFF, User.UserType.ADMIN],
            is_active=True,
        ).select_related("pole").order_by("pole__order", "first_name", "last_name", "username")
        pole_slug = request.query_params.get("pole")
        if pole_slug:
            qs = qs.filter(pole__slug=pole_slug)
        serializer = StaffMemberSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class OrganizationNodeDetailAPIView(APIView):
    """
    GET /api/organization/nodes/<slug>/
    Détail d'un noeud par slug (pour overlay).
    """

    def get(self, request, slug):
        node = get_object_or_404(
            OrganizationNode.objects.prefetch_related("node_events"),
            slug=slug,
        )
        serializer = OrganizationNodeSerializer(node, context={'request': request})
        return Response(serializer.data)


# ─── Admin views ──────────────────────────────────────────────────────────────

class OrganizationNodeAdminDetailAPIView(APIView):
    """
    PATCH /api/admin/organization/nodes/<slug>/ → modifier un noeud. Admin : direct. Staff : en attente.
    """
    permission_classes = [IsStaffOrSuperUser]

    def patch(self, request, slug):
        node = get_object_or_404(OrganizationNode, slug=slug)
        editable_fields = [
            "name", "description", "short_description", "content",
            "cta_text", "cta_url", "cover_image", "video_url",
            "planet_color", "orbit_radius", "orbit_speed", "planet_scale",
            "orbit_speed", "planet_type", "visual_source", "is_visible_3d",
        ]
        if _user_is_admin_direct(request.user):
            for field in editable_fields:
                if field in request.data:
                    setattr(node, field, request.data[field])
            node.save()
            invalidate_nodes_cache()
            serializer = OrganizationNodeSerializer(node, context={'request': request})
            return Response(serializer.data)
        payload = {k: v for k, v in request.data.items() if k in editable_fields}
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.ORGANIZATION_NODE,
            object_id=slug,
            payload=payload,
            requested_by=request.user,
        )
        return Response(
            {"message": "Modification enregistrée. Elle sera visible après approbation par un administrateur.", "pending": True},
            status=status.HTTP_202_ACCEPTED,
        )
