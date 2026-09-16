"""
Vues API Events — liste des événements avec filtres ; détail par slug.
Vues admin — créer, modifier, supprimer (éservé IsSuperUser).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.db.models import Max
import hashlib
from django.utils import timezone
from django.shortcuts import get_object_or_404
from apps.core.permissions import IsSuperUser, IsStaffOrSuperUser
from apps.core.models import PendingContentEdit
from .models import Event, FestivalShuttleDeparture, FestivalProgramSlot, FestivalAnnouncement
from .serializers import (
    EventSerializer,
    EventWriteSerializer,
    FestivalShuttleDepartureSerializer,
    FestivalProgramSlotSerializer,
    FestivalAnnouncementSerializer,
)



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


User = get_user_model()


def _artists_cache_token() -> str | None:
    """Empreinte légère du catalogue artistes (User sans updated_at)."""
    rows = (
        User.objects.filter(professions__isnull=False)
        .order_by("username")
        .values_list("username", "first_name", "last_name", "artist_display_order", "bio")
    )
    if not rows:
        return None
    payload = "|".join(":".join(str(x) for x in row) for row in rows)
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


class FestivalCacheManifestAPIView(APIView):
    """
    GET /api/festival/cache-manifest/?edition=2026
  Horodatages max (updated_at) pour cache mobile — rechargement partiel.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        edition = request.query_params.get("edition", "2026")

        artists_ts = _artists_cache_token()
        program_ts = FestivalProgramSlot.objects.filter(edition=edition).aggregate(
            m=Max("updated_at")
        )["m"]
        shuttle_ts = FestivalShuttleDeparture.objects.filter(edition=edition).aggregate(
            m=Max("updated_at")
        )["m"]

        def iso(dt):
            if dt is None:
                return None
            s = dt.isoformat()
            if s.endswith("+00:00"):
                return s[:-6] + "Z"
            return s

        return Response(
            {
                "edition": edition,
                "artists": artists_ts if isinstance(artists_ts, str) else iso(artists_ts),
                "program": iso(program_ts),
                "shuttles": iso(shuttle_ts),
            }
        )


class FestivalShuttleListAPIView(APIView):
    """
    GET /api/festival/shuttles/?edition=2026
    Horaires navettes groupés par jour (format app mobile).
    """

    permission_classes = [AllowAny]

    def get(self, request):
        edition = request.query_params.get("edition", "2026")
        qs = FestivalShuttleDeparture.objects.filter(edition=edition).order_by(
            "iso_date", "direction", "sort_order"
        )

        days: dict[str, dict] = {}
        for dep in qs:
            bucket = days.setdefault(
                dep.day_id,
                {
                    "id": dep.day_id,
                    "label": dep.day_label,
                    "date": dep.day_date,
                    "isoDate": dep.iso_date.isoformat(),
                    "toHotel": [],
                    "toPalmeraie": [],
                },
            )
            if dep.direction == FestivalShuttleDeparture.Direction.TO_HOTEL:
                bucket["toHotel"].append(dep.departure_time)
            else:
                bucket["toPalmeraie"].append(dep.departure_time)

        return Response(list(days.values()))


class FestivalShuttleFlatListAPIView(APIView):
    """
    GET /api/festival/shuttles/flat/?edition=2026&day_id=sam&direction=to_hotel
    Liste plate des départs (admin / debug).
    """

    permission_classes = [AllowAny]

    def get(self, request):
        edition = request.query_params.get("edition", "2026")
        qs = FestivalShuttleDeparture.objects.filter(edition=edition).order_by(
            "iso_date", "direction", "sort_order"
        )
        day_id = request.query_params.get("day_id")
        if day_id:
            qs = qs.filter(day_id=day_id)
        direction = request.query_params.get("direction")
        if direction:
            qs = qs.filter(direction=direction)
        serializer = FestivalShuttleDepartureSerializer(qs, many=True)
        return Response(serializer.data)


class FestivalProgramAPIView(APIView):
    """
    GET /api/festival/program/?edition=2026
    Planning workshops / soirées — format app mobile.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        edition = request.query_params.get("edition", "2026")
        qs = FestivalProgramSlot.objects.filter(edition=edition).order_by(
            "iso_date", "sort_order", "start_time"
        )

        day_id = request.query_params.get("day_id")
        if day_id:
            qs = qs.filter(day_id=day_id)
        room = request.query_params.get("room")
        if room:
            qs = qs.filter(room=room)

        slots = FestivalProgramSlotSerializer(qs, many=True).data

        days_seen: dict[str, dict] = {}
        stages_seen: set[str] = set()
        for slot in qs:
            days_seen.setdefault(
                slot.day_id,
                {
                    "id": slot.day_id,
                    "label": slot.day_label,
                    "date": slot.day_date,
                    "isoDate": slot.iso_date.isoformat(),
                },
            )
            stages_seen.add(slot.room)

        days = list(days_seen.values())
        stages = sorted(stages_seen)

        return Response({"edition": edition, "days": days, "stages": stages, "slots": slots})


class FestivalAnnouncementListAPIView(APIView):
    """
    GET /api/festival/announcements/?edition=2026&lang=en|fr|es
    Annonces publiées actives (urgent + normal) pour l’app / PWA.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        from django.utils import translation as django_translation

        edition = request.query_params.get("edition", "2026")
        lang = (request.query_params.get("lang") or "en").strip().lower()
        if lang not in {"en", "fr", "es"}:
            lang = "en"

        now = timezone.now()
        qs = FestivalAnnouncement.objects.filter(
            edition=edition,
            is_published=True,
        ).order_by("-priority", "sort_order", "-created_at")

        active = [a for a in qs if a.is_active_at(now)]
        django_translation.activate(lang)
        try:
            return Response(FestivalAnnouncementSerializer(active, many=True).data)
        finally:
            django_translation.deactivate()


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


class PushTokenRegisterAPIView(APIView):
    """
    POST /api/push/register/
    Enregistre ou met à jour un token push (Expo ou Web Push).
    Pas d'authentification requise (anonyme).

    Pour Expo Push (native):
        { "token": "ExponentPushToken[xxx]", "platform": "ios|android", "type": "expo" }

    Pour Web Push (PWA):
        { "subscription": { "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } }, "platform": "web", "type": "webpush" }
    """
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        from .models import PushToken

        token_type = request.data.get("type", "expo")
        platform = request.data.get("platform", "android")
        device_label = (request.data.get("device_label") or "")[:200]

        if token_type == "webpush":
            # Web Push subscription
            subscription = request.data.get("subscription", {})
            endpoint = subscription.get("endpoint")
            keys = subscription.get("keys", {})
            p256dh = keys.get("p256dh", "")
            auth = keys.get("auth", "")

            if not endpoint:
                return Response(
                    {"error": "Subscription endpoint requis"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Créer ou mettre à jour
            push_token, created = PushToken.objects.update_or_create(
                endpoint=endpoint,
                token_type=PushToken.TokenType.WEBPUSH,
                defaults={
                    "platform": platform,
                    "p256dh_key": p256dh,
                    "auth_key": auth,
                    "device_label": device_label,
                    "is_active": True,
                },
            )

        else:
            # Expo Push token
            token = request.data.get("token")

            if not token:
                return Response(
                    {"error": "Token requis"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Créer ou mettre à jour
            push_token, created = PushToken.objects.update_or_create(
                token=token,
                token_type=PushToken.TokenType.EXPO,
                defaults={
                    "platform": platform,
                    "device_label": device_label,
                    "is_active": True,
                },
            )

        return Response(
            {
                "success": True,
                "created": created,
                "token_id": str(push_token.id),
                "type": token_type,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

