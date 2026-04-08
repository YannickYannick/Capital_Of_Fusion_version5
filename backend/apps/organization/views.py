"""
Vues API Organization — liste des noeuds (Explore 3D) ; détail par slug.
Vues admin — modifier les noeuds d'organisation (staff ou superuser).
"""
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from apps.core.api_response import json_response_no_store
from apps.core.profile_external_links import parse_external_links_param
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
        return json_response_no_store(serializer.data)


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

def _org_node_plain_data(request):
    """Champs texte / JSON du PATCH (sans fichiers)."""
    out = {}
    for key in request.data:
        val = request.data.get(key)
        if hasattr(val, "read"):
            continue
        out[key] = val
    return out


class OrganizationNodeAdminDetailAPIView(APIView):
    """
    PATCH /api/admin/organization/nodes/<slug>/ → modifier un noeud. Admin : direct. Staff : en attente.
    JSON ou multipart (profile_image, cover_image).
    """
    permission_classes = [IsStaffOrSuperUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def patch(self, request, slug):
        node = get_object_or_404(OrganizationNode, slug=slug)
        plain = _org_node_plain_data(request)
        text_fields = (
            "name",
            "description",
            "short_description",
            "content",
            "cta_text",
            "cta_url",
            "video_url",
            "planet_color",
            "planet_type",
            "visual_source",
            "orbit_shape",
        )
        float_fields = (
            "orbit_radius",
            "orbit_speed",
            "planet_scale",
            "orbit_position_y",
            "orbit_roundness",
        )
        bool_fields = ("is_visible_3d",)

        def build_payload_dict(for_pending: bool):
            payload = {}
            for f in text_fields:
                if f in plain:
                    payload[f] = plain[f]
            for f in float_fields:
                if f in plain:
                    try:
                        payload[f] = float(plain[f])
                    except (TypeError, ValueError):
                        pass
            for f in bool_fields:
                if f in plain:
                    v = plain[f]
                    payload[f] = v in (True, "true", "1", "on", 1)
            if "external_links" in plain:
                pl = parse_external_links_param(plain["external_links"])
                if pl is not None:
                    payload["external_links"] = pl
            if not for_pending and _user_is_admin_direct(request.user):
                # fichiers résolus ailleurs
                pass
            return payload

        is_admin = _user_is_admin_direct(request.user)

        if is_admin:
            for f in text_fields:
                if f in plain:
                    setattr(node, f, str(plain[f] or ""))
            for f in float_fields:
                if f in plain:
                    try:
                        setattr(node, f, float(plain[f]))
                    except (TypeError, ValueError):
                        pass
            for f in bool_fields:
                if f in plain:
                    v = plain[f]
                    setattr(node, f, v in (True, "true", "1", "on", 1))
            if "external_links" in plain:
                pl = parse_external_links_param(plain["external_links"])
                if pl is not None:
                    node.external_links = pl
            if "profile_image" in request.FILES:
                node.profile_image = request.FILES["profile_image"]
            if "cover_image" in request.FILES:
                node.cover_image = request.FILES["cover_image"]
            node.save()
            invalidate_nodes_cache()
            serializer = OrganizationNodeSerializer(node, context={"request": request})
            return Response(serializer.data)

        payload = build_payload_dict(for_pending=True)
        if not payload:
            return Response(
                {"error": "Aucun champ modifiable (les images nécessitent un administrateur)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.ORGANIZATION_NODE,
            object_id=slug,
            payload=payload,
            requested_by=request.user,
        )
        return Response(
            {
                "message": "Modification enregistrée. Elle sera visible après approbation par un administrateur.",
                "pending": True,
            },
            status=status.HTTP_202_ACCEPTED,
        )
