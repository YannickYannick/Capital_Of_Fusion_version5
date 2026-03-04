"""
Vues API Courses — liste des cours avec filtres ; détail par slug.
Vues théorie — liste et détail des leçons de théorie.
Vues admin — créer, modifier, supprimer cours et leçons de théorie (réservé is_superuser).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Course, TheoryLesson
from .serializers import (
    CourseSerializer, CourseWriteSerializer,
    TheoryLessonSerializer, TheoryLessonWriteSerializer
)


def _require_admin(user):
    """Retourne True si l'utilisateur est superuser."""
    return user.is_authenticated and user.is_superuser


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


class TheoryLessonListAPIView(APIView):
    """
    GET /api/courses/theory/
    Liste des leçons de théorie actives. Query param optionnel : category.
    """

    def get(self, request):
        qs = TheoryLesson.objects.filter(is_active=True).select_related("level")
        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        serializer = TheoryLessonSerializer(qs, many=True)
        return Response(serializer.data)


class TheoryLessonDetailAPIView(APIView):
    """
    GET /api/courses/theory/<slug>/
    Détail d'une leçon de théorie par slug.
    """

    def get(self, request, slug):
        lesson = get_object_or_404(
            TheoryLesson.objects.select_related("level"),
            slug=slug,
            is_active=True,
        )
        serializer = TheoryLessonSerializer(lesson)
        return Response(serializer.data)


# ─── Admin views ──────────────────────────────────────────────────────────────

class CourseAdminAPIView(APIView):
    """
    POST /api/admin/courses/
    Créer un cours. Réservé aux superusers.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _require_admin(request.user):
            return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)
        serializer = CourseWriteSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseAdminDetailAPIView(APIView):
    """
    PATCH /api/admin/courses/<slug>/ → modifier un cours.
    DELETE /api/admin/courses/<slug>/ → supprimer un cours.
    Réservés aux superusers.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, slug):
        if not _require_admin(request.user):
            return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)
        course = get_object_or_404(Course, slug=slug)
        serializer = CourseWriteSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        if not _require_admin(request.user):
            return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)
        course = get_object_or_404(Course, slug=slug)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TheoryLessonAdminAPIView(APIView):
    """
    POST /api/admin/courses/theory/
    Créer une leçon de théorie. Réservé aux superusers.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _require_admin(request.user):
            return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)
        serializer = TheoryLessonWriteSerializer(data=request.data)
        if serializer.is_valid():
            lesson = serializer.save()
            return Response(TheoryLessonSerializer(lesson).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TheoryLessonAdminDetailAPIView(APIView):
    """
    PATCH /api/admin/courses/theory/<slug>/ → modifier une leçon.
    DELETE /api/admin/courses/theory/<slug>/ → supprimer une leçon.
    Réservés aux superusers.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, slug):
        if not _require_admin(request.user):
            return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)
        lesson = get_object_or_404(TheoryLesson, slug=slug)
        serializer = TheoryLessonWriteSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            lesson = serializer.save()
            return Response(TheoryLessonSerializer(lesson).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        if not _require_admin(request.user):
            return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)
        lesson = get_object_or_404(TheoryLesson, slug=slug)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
