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
from apps.core.permissions import IsStaffOrSuperUser
from .models import OrganizationNode, Pole
from .serializers import OrganizationNodeSerializer, PoleSerializer, StaffMemberSerializer

User = get_user_model(), StaffMemberSerializer



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
