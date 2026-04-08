"""
Vues API admin partenaires — création (staff / superuser).
"""
import json

from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from apps.core.permissions import IsStaffOrSuperUser
from apps.core.profile_external_links import parse_external_links_param
from apps.core.models import DanceStyle, Level
from apps.users.image_field_api_url import serialize_image_field_for_api
from .models import Partner, PartnerNode, PartnerEvent, PartnerCourse, PartnerSchedule
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

User = get_user_model()


def _parse_linked_artist_ids(plain: dict) -> list[int] | None:
    """Si la clé est absente : None (ne pas modifier le M2M). Sinon liste d’IDs utilisateur (peut être vide)."""
    if "linked_artist_ids" not in plain:
        return None
    raw = plain["linked_artist_ids"]
    if raw in (None, ""):
        return []
    if isinstance(raw, list):
        items = raw
    else:
        try:
            items = json.loads(str(raw))
        except (json.JSONDecodeError, TypeError):
            return []
    if not isinstance(items, list):
        return []
    out: list[int] = []
    for x in items:
        try:
            out.append(int(x))
        except (TypeError, ValueError):
            continue
    return list(dict.fromkeys(out))


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


def _partner_node_plain_data(request):
    out = {}
    for key in request.data:
        val = request.data.get(key)
        if hasattr(val, "read"):
            continue
        out[key] = val
    return out


class PartnerNodeAdminDetailAPIView(_StaffAuthMixin, APIView):
    """
    GET /api/admin/partners/nodes/<slug>/ — détail (staff).
    PATCH — textes, external_links, profile_image, cover_image (multipart ou JSON pour texte).
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, slug):
        node = get_object_or_404(
            PartnerNode.objects.select_related("parent", "partner").prefetch_related(
                Prefetch(
                    "linked_artists",
                    queryset=User.objects.order_by("first_name", "last_name", "username"),
                )
            ),
            slug=slug,
        )
        return Response(PartnerNodeSerializer(node, context={"request": request}).data)

    def patch(self, request, slug):
        node = get_object_or_404(PartnerNode, slug=slug)
        plain = _partner_node_plain_data(request)
        for f in (
            "name",
            "short_description",
            "description",
            "content",
            "cta_text",
            "cta_url",
        ):
            if f in plain:
                setattr(node, f, str(plain[f] or ""))
        if "type" in plain and plain["type"] in (
            PartnerNode.NodeType.ROOT,
            PartnerNode.NodeType.BRANCH,
            PartnerNode.NodeType.EVENT,
        ):
            node.type = plain["type"]
        if "external_links" in plain:
            pl = parse_external_links_param(plain["external_links"])
            if pl is not None:
                node.external_links = pl
        if "profile_image" in request.FILES:
            node.profile_image = request.FILES["profile_image"]
        if "cover_image" in request.FILES:
            node.cover_image = request.FILES["cover_image"]
        if "background_music_youtube_url" in plain:
            node.background_music_youtube_url = str(
                plain["background_music_youtube_url"] or ""
            ).strip()[:512]
        if plain.get("clear_background_music") in ("1", "true", True, "on"):
            if node.background_music:
                node.background_music.delete(save=False)
            node.background_music = None
        if "background_music" in request.FILES:
            node.background_music = request.FILES["background_music"]
        node.save()

        parsed_ids = _parse_linked_artist_ids(plain)
        if parsed_ids is not None:
            artist_users = User.objects.filter(professions__isnull=False).distinct()
            valid = list(artist_users.filter(pk__in=parsed_ids).values_list("pk", flat=True))
            if set(valid) != set(parsed_ids):
                return Response(
                    {
                        "linked_artist_ids": [
                            "Chaque identifiant doit correspondre à un artiste de l’annuaire "
                            "(profil avec au moins une profession)."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            node.linked_artists.set(valid)

        node = (
            PartnerNode.objects.select_related("parent", "partner")
            .prefetch_related(
                Prefetch(
                    "linked_artists",
                    queryset=User.objects.order_by("first_name", "last_name", "username"),
                )
            )
            .get(pk=node.pk)
        )
        return Response(PartnerNodeSerializer(node, context={"request": request}).data)


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


def _assign_fk_uuid(obj, field_name: str, plain: dict, key: str) -> None:
    """Assigne partner_id / node_id / style_id depuis le formulaire (UUID string ou vide)."""
    if key not in plain:
        return
    v = plain[key]
    if v in (None, "", "null"):
        setattr(obj, f"{field_name}_id", None)
    else:
        setattr(obj, f"{field_name}_id", v)


class PartnerEventAdminDetailAPIView(_StaffAuthMixin, APIView):
    """
    GET / PATCH /api/admin/partners/events/<slug>/
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, slug):
        event = get_object_or_404(
            PartnerEvent.objects.select_related("partner", "node"),
            slug=slug,
        )
        return Response(PartnerEventSerializer(event, context={"request": request}).data)

    def patch(self, request, slug):
        event = get_object_or_404(PartnerEvent, slug=slug)
        plain = _partner_node_plain_data(request)
        if "name" in plain:
            event.name = str(plain["name"] or "")
        if "description" in plain:
            event.description = str(plain["description"] or "")
        if "external_links" in plain:
            pl = parse_external_links_param(plain["external_links"])
            if pl is not None:
                event.external_links = pl
        if "type" in plain and plain["type"] in (
            PartnerEvent.EventType.FESTIVAL,
            PartnerEvent.EventType.PARTY,
            PartnerEvent.EventType.WORKSHOP,
        ):
            event.type = plain["type"]
        if "location_name" in plain:
            event.location_name = str(plain["location_name"] or "")
        if "start_date" in plain:
            d = parse_date(str(plain["start_date"] or ""))
            if d:
                event.start_date = d
        if "end_date" in plain:
            d = parse_date(str(plain["end_date"] or ""))
            if d:
                event.end_date = d
        _assign_fk_uuid(event, "partner", plain, "partner")
        _assign_fk_uuid(event, "node", plain, "node")
        if "profile_image" in request.FILES:
            event.profile_image = request.FILES["profile_image"]
        if "cover_image" in request.FILES:
            event.cover_image = request.FILES["cover_image"]
        if "image" in request.FILES:
            event.image = request.FILES["image"]
        event.save()
        event = PartnerEvent.objects.select_related("partner", "node").get(pk=event.pk)
        return Response(PartnerEventSerializer(event, context={"request": request}).data)


class PartnerCourseAdminDetailAPIView(_StaffAuthMixin, APIView):
    """
    GET / PATCH /api/admin/partners/courses/<slug>/
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, slug):
        course = get_object_or_404(
            PartnerCourse.objects.select_related(
                "style", "level", "node", "partner"
            ).prefetch_related("schedules"),
            slug=slug,
        )
        return Response(PartnerCourseSerializer(course, context={"request": request}).data)

    def patch(self, request, slug):
        course = get_object_or_404(PartnerCourse, slug=slug)
        plain = _partner_node_plain_data(request)
        if "name" in plain:
            course.name = str(plain["name"] or "")
        if "description" in plain:
            course.description = str(plain["description"] or "")
        if "location_name" in plain:
            course.location_name = str(plain["location_name"] or "")[:255]
        if "external_links" in plain:
            pl = parse_external_links_param(plain["external_links"])
            if pl is not None:
                course.external_links = pl
        if "is_active" in plain:
            v = plain["is_active"]
            course.is_active = v in (True, "true", "1", "on", 1)
        _assign_fk_uuid(course, "style", plain, "style")
        _assign_fk_uuid(course, "level", plain, "level")
        _assign_fk_uuid(course, "partner", plain, "partner")
        _assign_fk_uuid(course, "node", plain, "node")
        if "image" in request.FILES:
            course.image = request.FILES["image"]
        schedules_raw = plain.get("schedules") if "schedules" in plain else None
        try:
            schedules_payload = None
            if schedules_raw is not None:
                schedules_payload = json.loads(str(schedules_raw)) if str(schedules_raw).strip() else []
                if not isinstance(schedules_payload, list):
                    schedules_payload = []
        except json.JSONDecodeError:
            return Response({"schedules": ["Format invalide."]}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            course.save()
            if schedules_payload is not None:
                # Remplacement complet des créneaux
                course.schedules.all().delete()
                new_objs = []
                for it in schedules_payload:
                    if not isinstance(it, dict):
                        continue
                    try:
                        dow = int(it.get("day_of_week"))
                    except (TypeError, ValueError):
                        continue
                    st = str(it.get("start_time") or "").strip()
                    et = str(it.get("end_time") or "").strip()
                    if not st or not et:
                        continue
                    loc = str(it.get("location_name") or "").strip()[:255]
                    level_id = it.get("level") or None
                    if level_id in ("", "null"):
                        level_id = None
                    # Vérifie FK level si fourni
                    if level_id is not None and not Level.objects.filter(pk=level_id).exists():
                        return Response(
                            {"schedules": ["Niveau invalide sur un créneau."]},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    new_objs.append(
                        PartnerSchedule(
                            course=course,
                            day_of_week=dow,
                            start_time=st,
                            end_time=et,
                            location_name=loc,
                            level_id=level_id,
                        )
                    )
                if new_objs:
                    PartnerSchedule.objects.bulk_create(new_objs)

        course = (
            PartnerCourse.objects.select_related("style", "level", "node", "partner")
            .prefetch_related("schedules", "schedules__level")
            .get(pk=course.pk)
        )
        return Response(PartnerCourseSerializer(course, context={"request": request}).data)


def _partner_brand_dict(partner: Partner, request):
    return {
        "id": str(partner.id),
        "name": partner.name,
        "slug": partner.slug,
        "description": partner.description,
        "logo": serialize_image_field_for_api(partner.logo, request),
    }


class PartnerBrandAdminDetailAPIView(_StaffAuthMixin, APIView):
    """
    GET / PATCH /api/admin/partners/brands/<slug>/
    Entité « Partenaire » (marque), distincte des structures (nodes).
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, slug):
        partner = get_object_or_404(Partner, slug=slug)
        return Response(_partner_brand_dict(partner, request))

    def patch(self, request, slug):
        partner = get_object_or_404(Partner, slug=slug)
        plain = _partner_node_plain_data(request)
        if "name" in plain:
            partner.name = str(plain["name"] or "")
        if "description" in plain:
            partner.description = str(plain["description"] or "")
        if "slug" in plain:
            ns = slugify(str(plain["slug"] or ""))
            if ns and ns != partner.slug:
                if Partner.objects.filter(slug=ns).exclude(pk=partner.pk).exists():
                    return Response(
                        {"slug": ["Ce slug existe déjà."]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                partner.slug = ns
        if "logo" in request.FILES:
            partner.logo = request.FILES["logo"]
        partner.save()
        partner = Partner.objects.get(pk=partner.pk)
        return Response(_partner_brand_dict(partner, request))
