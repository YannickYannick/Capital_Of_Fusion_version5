"""
Application d'une modification en attente (PendingContentEdit) sur l'objet cible.
Appelé lorsqu'un admin approuve la demande.
"""
from django.utils import timezone
from django.conf import settings

from apps.core.models import PendingContentEdit, SiteConfiguration, Bulletin

TRANSLATION_LANGS = frozenset({"fr", "en", "es"})


def _apply_siteconfig_translated_payload(config: SiteConfiguration, payload: dict, lang: str) -> None:
    for base in ("vision_markdown", "history_markdown"):
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
        lang = raw.pop("_lang", None) or "fr"
        if lang not in TRANSLATION_LANGS:
            lang = "fr"
        filtered = {
            k: v
            for k, v in raw.items()
            if k in ("vision_markdown", "history_markdown")
        }
        _apply_siteconfig_translated_payload(config, filtered, lang)
        return

    if ct == PendingContentEdit.ContentType.BULLETIN:
        bulletin = Bulletin.objects.get(slug=oid)
        raw = dict(edit.payload or {})
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
            "planet_type", "visual_source", "is_visible_3d",
        ]
        for field in editable:
            if field in payload:
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
