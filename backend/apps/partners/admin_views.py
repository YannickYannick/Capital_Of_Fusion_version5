"""
Vues API admin partenaires — création (staff / superuser).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.core.permissions import IsStaffOrSuperUser
from apps.core.models import DanceStyle, Level
from .models import Partner, PartnerNode, PartnerEvent, PartnerCourse
from .serializers import (
    PartnerMinimalSerializer,
    PartnerNodeSerializer,
    PartnerEventSerializer,
    PartnerCourseSerializer,
)
from .admin_serializers import (
    PartnerAdminSerializer,
    PartnerNodeAdminSerializer,
    PartnerEventAdminSerializer,
    PartnerCourseAdminSerializer,
    DanceStyleMinimalSerializer,
    LevelMinimalSerializer,
)


class _StaffAuthMixin:
    permission_classes = [IsStaffOrSuperUser]


class PartnerAdminListCreateAPIView(_StaffAuthMixin, APIView):
    """
    GET /api/admin/partners/ — liste des partenaires (formulaires).
    POST /api/admin/partners/ — créer un partenaire.
    """

    def get(self, request):
        qs = Partner.objects.all().order_by("name")
        return Response(PartnerMinimalSerializer(qs, many=True).data)

    def post(self, request):
        ser = PartnerAdminSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        partner = ser.save()
        return Response(
            PartnerMinimalSerializer(partner).data,
            status=status.HTTP_201_CREATED,
        )


class PartnerCourseMetaAPIView(_StaffAuthMixin, APIView):
    """
    GET /api/admin/partners/course-meta/
    Styles et niveaux (UUID) pour créer un cours partenaire.
    """

    def get(self, request):
        styles = DanceStyle.objects.all().order_by("name")
        levels = Level.objects.all().order_by("order", "name")
        return Response(
            {
                "styles": DanceStyleMinimalSerializer(styles, many=True).data,
                "levels": LevelMinimalSerializer(levels, many=True).data,
            }
        )


class PartnerNodeAdminCreateAPIView(_StaffAuthMixin, APIView):
    """POST /api/admin/partners/nodes/ — créer une structure partenaire."""

    def post(self, request):
        ser = PartnerNodeAdminSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        node = ser.save()
        return Response(
            PartnerNodeSerializer(node, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PartnerEventAdminCreateAPIView(_StaffAuthMixin, APIView):
    """POST /api/admin/partners/events/ — créer un événement partenaire."""

    def post(self, request):
        ser = PartnerEventAdminSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        event = ser.save()
        return Response(
            PartnerEventSerializer(event, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PartnerCourseAdminCreateAPIView(_StaffAuthMixin, APIView):
    """POST /api/admin/partners/courses/ — créer un cours partenaire."""

    def post(self, request):
        ser = PartnerCourseAdminSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        course = ser.save()
        course = PartnerCourse.objects.select_related(
            "style", "level", "node", "partner"
        ).prefetch_related("schedules").get(pk=course.pk)
        return Response(
            PartnerCourseSerializer(course, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
