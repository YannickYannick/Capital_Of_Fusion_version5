"""
Vues API Courses — liste des cours avec filtres ; détail par slug.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Course
from .serializers import CourseSerializer


class CourseListAPIView(APIView):
    """
    GET /api/courses/
    Liste des Course actifs. Query params optionnels : style, level, node (slugs ou UUID).
    """

    def get(self, request):
        qs = Course.objects.filter(is_active=True).select_related(
            "style", "level", "node"
        )
        style = request.query_params.get("style")
        if style:
            qs = qs.filter(style__slug=style)
        level = request.query_params.get("level")
        if level:
            qs = qs.filter(level__slug=level)
        node = request.query_params.get("node")
        if node:
            if len(node) == 36 and "-" in node:
                qs = qs.filter(node_id=node)
            else:
                qs = qs.filter(node__slug=node)
        serializer = CourseSerializer(qs, many=True)
        return Response(serializer.data)


class CourseDetailAPIView(APIView):
    """
    GET /api/courses/<slug>/
    Détail d'un cours actif par slug. 404 si non trouvé ou inactif.
    """

    def get(self, request, slug):
        course = get_object_or_404(
            Course.objects.select_related("style", "level", "node"),
            slug=slug,
            is_active=True,
        )
        serializer = CourseSerializer(course)
        return Response(serializer.data)
