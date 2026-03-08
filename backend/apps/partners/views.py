"""
Vues API Partners — liste et détail des structures, événements et cours partenaires.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import PartnerNode, PartnerEvent, PartnerCourse
from .serializers import (
    PartnerNodeSerializer,
    PartnerEventSerializer,
    PartnerCourseSerializer,
)


class PartnerNodeListAPIView(APIView):
    """
    GET /api/partners/nodes/
    Liste des structures partenaires.
    ?for_structure=1 : tous avec parent_slug (pour arbre / annuaire).
    """

    def get(self, request):
        for_structure = request.query_params.get("for_structure") in ("1", "true")
        qs = PartnerNode.objects.all().select_related("parent", "partner")
        if for_structure:
            qs = qs.order_by("created_at")
        else:
            qs = qs.order_by("name")
        serializer = PartnerNodeSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class PartnerNodeDetailAPIView(APIView):
    """
    GET /api/partners/nodes/<slug>/
    Détail d'une structure partenaire par slug.
    """

    def get(self, request, slug):
        node = get_object_or_404(
            PartnerNode.objects.select_related("partner", "parent"),
            slug=slug,
        )
        serializer = PartnerNodeSerializer(node, context={"request": request})
        return Response(serializer.data)


class PartnerEventListAPIView(APIView):
    """
    GET /api/partners/events/
    Liste des événements partenaires. Query params : type, node (slug), upcoming.
    """

    def get(self, request):
        qs = PartnerEvent.objects.all().select_related("node", "partner")
        upcoming = request.query_params.get("upcoming", "").lower()
        if upcoming in ("1", "true", "yes"):
            today = timezone.now().date()
            qs = qs.filter(end_date__gte=today)
        event_type = request.query_params.get("type")
        if event_type:
            qs = qs.filter(type=event_type)
        node = request.query_params.get("node")
        if node:
            qs = qs.filter(node__slug=node)
        qs = qs.order_by("start_date")
        serializer = PartnerEventSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class PartnerEventDetailAPIView(APIView):
    """
    GET /api/partners/events/<slug>/
    Détail d'un événement partenaire par slug.
    """

    def get(self, request, slug):
        event = get_object_or_404(
            PartnerEvent.objects.select_related("node", "partner"),
            slug=slug,
        )
        serializer = PartnerEventSerializer(event, context={"request": request})
        return Response(serializer.data)


class PartnerCourseListAPIView(APIView):
    """
    GET /api/partners/courses/
    Liste des cours partenaires actifs. Query params : style, level, node (slug).
    """

    def get(self, request):
        qs = PartnerCourse.objects.filter(is_active=True).select_related(
            "style", "level", "node", "partner"
        ).prefetch_related("schedules")
        style = request.query_params.get("style")
        if style:
            qs = qs.filter(style__slug=style)
        level = request.query_params.get("level")
        if level:
            qs = qs.filter(level__slug=level)
        node = request.query_params.get("node")
        if node:
            qs = qs.filter(node__slug=node)
        serializer = PartnerCourseSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class PartnerCourseDetailAPIView(APIView):
    """
    GET /api/partners/courses/<slug>/
    Détail d'un cours partenaire par slug.
    """

    def get(self, request, slug):
        course = get_object_or_404(
            PartnerCourse.objects.select_related("style", "level", "node", "partner").prefetch_related(
                "schedules"
            ),
            slug=slug,
            is_active=True,
        )
        serializer = PartnerCourseSerializer(course, context={"request": request})
        return Response(serializer.data)
