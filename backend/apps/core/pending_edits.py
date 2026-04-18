"""
Application d'une modification en attente (PendingContentEdit) sur l'objet cible.
Appelé lorsqu'un admin approuve la demande.
"""
from django.utils import timezone
from django.conf import settings

from django.contrib.auth import get_user_model

from apps.core.models import PendingContentEdit, SiteConfiguration, Bulletin
from apps.core.profile_external_links import normalize_external_links

User = get_user_model()

TRANSLATION_LANGS = frozenset({"fr", "en", "es"})

# Champs SiteConfiguration patchables (colonnes modeltranslation *_fr / _en / _es).
SITE_CONFIG_MARKDOWN_PATCH_KEYS = (
    "vision_markdown",
    "history_markdown",
    "identite_adn_festival_markdown",
    "festival_planning_navettes_markdown",
    "festival_acces_venue_markdown",
    "festival_jack_n_jill_markdown",
    "festival_all_star_street_battle_markdown",
    "festival_book_your_hotel_markdown",
    "festival_notre_programme_markdown",
    "support_faq_markdown",
    "support_contact_markdown",
)


def _apply_siteconfig_translated_payload(config: SiteConfiguration, payload: dict, lang: str) -> None:
    for base in SITE_CONFIG_MARKDOWN_PATCH_KEYS:
        if base in payload:
            setattr(config, f"{base}_{lang}", payload[base])
    config.save()


def apply_pending_edit(edit: PendingContentEdit) -> None:
    """
    Applique le payload d'une PendingContentEdit sur l'objet concerné.
    Lève ValueError si content_type ou object_id invalide.
    """
    ct = edit.content_type
    oid = (edit.object_id or "").strip()
    payload = edit.payload or {}

    if ct == PendingContentEdit.ContentType.SITECONFIG:
        config = SiteConfiguration.objects.first()
        if not config:
            config = SiteConfiguration.objects.create()
        raw = dict(edit.payload or {})
        # Traductions multi-langues soumises par le staff (validation admin)
        if raw.get("kind") == "translation" and isinstance(
            raw.get("translation_proposal"), dict
        ):
            proposal = raw["translation_proposal"]
            for lang, fields in proposal.items():
                if lang not in ("en", "es"):
                    continue
                if not isinstance(fields, dict):
                    continue
                filtered = {
                    k: v
                    for k, v in fields.items()
                    if k in SITE_CONFIG_MARKDOWN_PATCH_KEYS
                }
                if filtered:
                    _apply_siteconfig_translated_payload(config, filtered, lang)
            return
        lang = raw.pop("_lang", None) or "fr"
        if lang not in TRANSLATION_LANGS:
            lang = "fr"
        filtered = {
            k: v
            for k, v in raw.items()
            if k in SITE_CONFIG_MARKDOWN_PATCH_KEYS
        }
        _apply_siteconfig_translated_payload(config, filtered, lang)
        return

    if ct == PendingContentEdit.ContentType.BULLETIN:
        bulletin = Bulletin.objects.get(slug=oid)
        raw = dict(edit.payload or {})
        if raw.get("kind") == "translation" and isinstance(raw.get("translation_proposal"), dict):
            proposal = raw["translation_proposal"]
            for lang, fields in proposal.items():
                if lang not in ("en", "es"):
                    continue
                if not isinstance(fields, dict):
                    continue
                for k in ("title", "content_markdown"):
                    if k in fields:
                        setattr(bulletin, f"{k}_{lang}", fields[k])
            bulletin.save()
            return
        lang = raw.pop("_lang", None) or "fr"
        if lang not in TRANSLATION_LANGS:
            lang = "fr"
        if "title" in raw:
            setattr(bulletin, f"title_{lang}", raw["title"])
        if "content_markdown" in raw:
            setattr(bulletin, f"content_markdown_{lang}", raw["content_markdown"])
        if "slug" in raw:
            bulletin.slug = raw["slug"]
        if "published_at" in raw:
            bulletin.published_at = raw["published_at"]
        if "is_published" in raw:
            bulletin.is_published = raw["is_published"]
        bulletin.save()
        return

    if ct == PendingContentEdit.ContentType.USER_ARTIST_BIO:
        user = User.objects.get(pk=int(oid))
        raw = dict(edit.payload or {})
        if raw.get("kind") == "translation" and isinstance(raw.get("translation_proposal"), dict):
            proposal = raw["translation_proposal"]
            for lang, fields in proposal.items():
                if lang not in ("en", "es"):
                    continue
                if not isinstance(fields, dict):
                    continue
                if "bio" in fields:
                    setattr(user, f"bio_{lang}", fields["bio"])
            user.save()
        return

    if ct == PendingContentEdit.ContentType.USER_ARTIST_CREATE:
        from apps.users.serializers import ArtistCreateSerializer

        serializer = ArtistCreateSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return

    if ct == PendingContentEdit.ContentType.EVENT:
        from apps.events.models import Event
        from apps.events.serializers import EventWriteSerializer
        event = Event.objects.get(slug=oid)
        serializer = EventWriteSerializer(event, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return

    if ct == PendingContentEdit.ContentType.COURSE:
        from apps.courses.models import Course
        from apps.courses.serializers import CourseWriteSerializer
        course = Course.objects.get(slug=oid)
        serializer = CourseWriteSerializer(course, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return

    if ct == PendingContentEdit.ContentType.THEORY_LESSON:
        from apps.courses.models import TheoryLesson
        from apps.courses.serializers import TheoryLessonWriteSerializer
        lesson = TheoryLesson.objects.get(slug=oid)
        serializer = TheoryLessonWriteSerializer(lesson, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return

    if ct == PendingContentEdit.ContentType.ORGANIZATION_NODE:
        from apps.organization.models import OrganizationNode
        node = OrganizationNode.objects.get(slug=oid)
        editable = [
            "name", "description", "short_description", "content",
            "cta_text", "cta_url", "cover_image", "video_url",
            "planet_color", "orbit_radius", "orbit_speed", "planet_scale",
            "planet_type", "visual_source", "is_visible_3d", "external_links",
        ]
        for field in editable:
            if field not in payload:
                continue
            if field == "external_links":
                node.external_links = normalize_external_links(payload[field])
            else:
                setattr(node, field, payload[field])
        node.save()
        return

    if ct == PendingContentEdit.ContentType.PROJECT:
        from apps.projects.models import Project
        project = Project.objects.get(slug=oid)
        for key, value in payload.items():
            if hasattr(project, key):
                setattr(project, key, value)
        project.save(update_fields=list(payload.keys()) + ["updated_at"])
        return

    raise ValueError(f"Content type non géré: {ct}")
