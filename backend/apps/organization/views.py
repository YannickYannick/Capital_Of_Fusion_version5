"""
Vues API Organization — liste des noeuds (Explore 3D) ; détail par slug.
Vues admin — modifier les noeuds d'organisation (réservé is_superuser).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import OrganizationNode
from .serializers import OrganizationNodeSerializer


def _require_admin(user):
    return user.is_authenticated and user.is_superuser


class OrganizationNodeListAPIView(APIView):
    """
    GET /api/organization/nodes/
    Liste des noeuds visibles en 3D (is_visible_3d=True), avec node_events.
    Pour Explore 3D : planètes + paramètres orbit/planet.
    """

    def get(self, request):
        qs = OrganizationNode.objects.filter(
            is_visible_3d=True
        ).prefetch_related("node_events").order_by("created_at")
        serializer = OrganizationNodeSerializer(qs, many=True, context={'request': request})
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
    Réservé aux superusers.
    Note : la création et suppression de noeuds se fait via l'admin Django
    car cela affecte la structure 3D.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, slug):
        if not _require_admin(request.user):
            return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)
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
