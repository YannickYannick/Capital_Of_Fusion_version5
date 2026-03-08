"""
Vues API Events — liste des événements avec filtres ; détail par slug.
Vues admin — créer, modifier, supprimer (éservé IsSuperUser).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from apps.core.permissions import IsSuperUser, IsStaffOrSuperUser
from apps.core.models import PendingContentEdit
from .models import Event
from .serializers import EventSerializer, EventWriteSerializer



class EventListAPIView(APIView):
    """
    GET /api/events/
    Liste des Event (à venir ou tous). Query params : type, node.
    """

    def get(self, request):
        qs = Event.objects.all().select_related("node")
        # Optionnel : seulement à venir
        upcoming = request.query_params.get("upcoming", "").lower()
        if upcoming in ("1", "true", "yes"):
            today = timezone.now().date()
            qs = qs.filter(end_date__gte=today)
        event_type = request.query_params.get("type")
        if event_type:
            qs = qs.filter(type=event_type)
        node = request.query_params.get("node")
        if node:
            if len(node) == 36 and "-" in node:
                qs = qs.filter(node_id=node)
            else:
                qs = qs.filter(node__slug=node)
        qs = qs.order_by("start_date")
        serializer = EventSerializer(qs, many=True)
        return Response(serializer.data)


class EventDetailAPIView(APIView):
    """
    GET /api/events/<slug>/
    Détail d'un événement par slug. 404 si non trouvé.
    """

    def get(self, request, slug):
        event = get_object_or_404(
            Event.objects.select_related("node"),
            slug=slug,
        )
        serializer = EventSerializer(event)
        return Response(serializer.data)


# ─── Admin views ──────────────────────────────────────────────────────────────

class EventAdminAPIView(APIView):
    """
    POST /api/admin/events/
    Créer un événement. Réservé aux superusers.
    """
    permission_classes = [IsSuperUser]

    def post(self, request):
        serializer = EventWriteSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save()
            return Response(EventSerializer(event).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventAdminDetailAPIView(APIView):
    """
    PATCH /api/admin/events/<slug>/  → modifier un événement. Admin : direct. Staff : en attente.
    DELETE /api/admin/events/<slug>/ → supprimer (admin uniquement).
    """
    permission_classes = [IsStaffOrSuperUser]

    def _get_event(self, slug):
        return get_object_or_404(Event, slug=slug)

    def patch(self, request, slug):
        event = self._get_event(slug)
        serializer = EventWriteSerializer(event, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if getattr(request.user, "is_superuser", False):
            event = serializer.save()
            return Response(EventSerializer(event).data)
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.EVENT,
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
        event = self._get_event(slug)
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

