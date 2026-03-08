"""
Vues API Organization — liste des noeuds (Explore 3D) ; détail par slug.
Vues admin — modifier les noeuds d'organisation (staff ou superuser).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.core.permissions import IsStaffOrSuperUser
from .models import OrganizationNode
from .serializers import OrganizationNodeSerializer



class OrganizationNodeListAPIView(APIView):
    """
    GET /api/organization/nodes/
    Par défaut : noeuds visibles en 3D (is_visible_3d=True), avec node_events.
    GET /api/organization/nodes/?for_structure=1 : tous les noeuds (pour l’organigramme), avec parent_slug.
    """

    def get(self, request):
        for_structure = request.query_params.get("for_structure") in ("1", "true")
        if for_structure:
            qs = (
                OrganizationNode.objects.all()
                .select_related("parent")
                .prefetch_related("node_events")
                .order_by("created_at")
            )
        else:
            qs = OrganizationNode.objects.filter(
                is_visible_3d=True
            ).prefetch_related("node_events").order_by("created_at")
        serializer = OrganizationNodeSerializer(qs, many=True, context={"request": request})
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
    PATCH /api/admin/organization/nodes/<slug>/ → modifier un noeud.
    Réservé aux membres du staff (ou superusers).
    Permet aux staff de modifier les descriptions depuis la page Explore.
    """
    permission_classes = [IsStaffOrSuperUser]

    def patch(self, request, slug):
        node = get_object_or_404(OrganizationNode, slug=slug)
        # Champs éditables depuis le frontend admin
        editable_fields = [
            "name", "description", "short_description", "content",
            "cta_text", "cta_url", "cover_image", "video_url",
            "planet_color", "orbit_radius", "orbit_speed", "planet_scale",
            "orbit_speed", "planet_type", "visual_source", "is_visible_3d",
        ]
        for field in editable_fields:
            if field in request.data:
                setattr(node, field, request.data[field])
        node.save()
        serializer = OrganizationNodeSerializer(node, context={'request': request})
        return Response(serializer.data)
