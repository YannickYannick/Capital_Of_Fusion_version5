"""
Vues API Events — liste des événements avec filtres optionnels (type, node).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Event
from .serializers import EventSerializer


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
