"""
Vues API Organization — liste des noeuds (Explore 3D) ; détail par slug.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import OrganizationNode
from .serializers import OrganizationNodeSerializer


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
        serializer = OrganizationNodeSerializer(qs, many=True)
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
        serializer = OrganizationNodeSerializer(node)
        return Response(serializer.data)
