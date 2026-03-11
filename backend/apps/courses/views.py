"""
Vues API Courses — liste des cours avec filtres ; détail par slug.
Vues théorie — liste et détail des leçons de théorie.
Vues admin — créer, modifier, supprimer cours et leçons (réservé IsSuperUser).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.core.permissions import IsSuperUser, IsStaffOrSuperUser
from apps.core.models import PendingContentEdit
from .models import Course, TheoryLesson
from .serializers import (
    CourseSerializer, CourseListSerializer, CourseWriteSerializer,
    TheoryLessonSerializer, TheoryLessonWriteSerializer, ScheduleSerializer
)


class CourseListAPIView(APIView):
    """
    GET /api/courses/
    Liste des Course actifs. Query params optionnels : style, level, node (slugs ou UUID).
    """

    def get(self, request):
        qs = Course.objects.filter(is_active=True).select_related(
            "style", "level", "node"
        ).prefetch_related("schedules", "teachers")
        
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
        
        # Filtre par jour de la semaine
        day = request.query_params.get("day")
        if day is not None:
            try:
                qs = qs.filter(schedules__day_of_week=int(day)).distinct()
            except ValueError:
                pass
        
        serializer = CourseListSerializer(qs, many=True)
        return Response(serializer.data)


class CourseDetailAPIView(APIView):
    """
    GET /api/courses/<slug>/
    Détail d'un cours actif par slug avec schedules et teachers. 404 si non trouvé ou inactif.
    """

    def get(self, request, slug):
        course = get_object_or_404(
            Course.objects.select_related("style", "level", "node").prefetch_related("schedules", "teachers"),
            slug=slug,
            is_active=True,
        )
        serializer = CourseSerializer(course)
        return Response(serializer.data)


class ScheduleListAPIView(APIView):
    """
    GET /api/courses/schedules/
    Liste de tous les horaires de cours actifs. Utile pour le planning.
    Query params: ?day=0 (lundi), ?style=slug, ?level=slug
    """

    def get(self, request):
        from .models import Schedule
        qs = Schedule.objects.filter(course__is_active=True).select_related(
            "course", "course__style", "course__level", "course__node"
        ).order_by("day_of_week", "start_time")

        day = request.query_params.get("day")
        if day is not None:
            try:
                qs = qs.filter(day_of_week=int(day))
            except ValueError:
                pass

        style = request.query_params.get("style")
        if style:
            qs = qs.filter(course__style__slug=style)

        level = request.query_params.get("level")
        if level:
            qs = qs.filter(course__level__slug=level)

        data = []
        for schedule in qs:
            data.append({
                "id": str(schedule.id),
                "course_id": str(schedule.course.id),
                "course_name": schedule.course.name,
                "course_slug": schedule.course.slug,
                "style_name": schedule.course.style.name,
                "style_slug": schedule.course.style.slug,
                "level_name": schedule.course.level.name,
                "level_slug": schedule.course.level.slug,
                "level_color": schedule.course.level.color,
                "node_name": schedule.course.node.name,
                "day_of_week": schedule.day_of_week,
                "day_display": schedule.get_day_of_week_display(),
                "start_time": schedule.start_time.strftime("%H:%M"),
                "end_time": schedule.end_time.strftime("%H:%M"),
                "location_name": schedule.location_name,
            })
        return Response(data)


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
    permission_classes = [IsSuperUser]

    def post(self, request):
        serializer = CourseWriteSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseAdminDetailAPIView(APIView):
    """
    PATCH /api/admin/courses/<slug>/ → modifier un cours. Admin : direct. Staff : en attente.
    DELETE : admin uniquement.
    """
    permission_classes = [IsStaffOrSuperUser]

    def patch(self, request, slug):
        course = get_object_or_404(Course, slug=slug)
        serializer = CourseWriteSerializer(course, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if getattr(request.user, "is_superuser", False):
            course = serializer.save()
            return Response(CourseSerializer(course).data)
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.COURSE,
            object_id=slug,
            payload=request.data,
            requested_by=request.user,
        )
        return Response(
            {"message": "Modification enregistrée. Elle sera visible après approbation par un administrateur.", "pending": True},
            status=status.HTTP_202_ACCEPTED,
        )

    def delete(self, request, slug):
        if not getattr(request.user, "is_superuser", False):
            return Response({"detail": "Action non autorisée."}, status=status.HTTP_403_FORBIDDEN)
        course = get_object_or_404(Course, slug=slug)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TheoryLessonAdminAPIView(APIView):
    """
    POST /api/admin/courses/theory/
    Créer une leçon de théorie. Réservé aux superusers.
    """
    permission_classes = [IsSuperUser]

    def post(self, request):
        serializer = TheoryLessonWriteSerializer(data=request.data)
        if serializer.is_valid():
            lesson = serializer.save()
            return Response(TheoryLessonSerializer(lesson).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TheoryLessonAdminDetailAPIView(APIView):
    """
    PATCH /api/admin/courses/theory/<slug>/ → modifier une leçon. Admin : direct. Staff : en attente.
    DELETE : admin uniquement.
    """
    permission_classes = [IsStaffOrSuperUser]

    def patch(self, request, slug):
        lesson = get_object_or_404(TheoryLesson, slug=slug)
        serializer = TheoryLessonWriteSerializer(lesson, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if getattr(request.user, "is_superuser", False):
            lesson = serializer.save()
            return Response(TheoryLessonSerializer(lesson).data)
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.THEORY_LESSON,
            object_id=slug,
            payload=request.data,
            requested_by=request.user,
        )
        return Response(
            {"message": "Modification enregistrée. Elle sera visible après approbation par un administrateur.", "pending": True},
            status=status.HTTP_202_ACCEPTED,
        )

    def delete(self, request, slug):
        if not getattr(request.user, "is_superuser", False):
            return Response({"detail": "Action non autorisée."}, status=status.HTTP_403_FORBIDDEN)
        lesson = get_object_or_404(TheoryLesson, slug=slug)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
