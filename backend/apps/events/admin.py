from django import forms
from django.contrib import admin, messages

from .models import (
    Event,
    EventPass,
    FestivalAnnouncement,
    FestivalShuttleDeparture,
    FestivalProgramSlot,
    PushToken,
    Registration,
)
from .push_service import send_announcement_notification


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "type", "start_date", "end_date", "node")
    list_filter = ("type", "node")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(EventPass)
class EventPassAdmin(admin.ModelAdmin):
    list_display = ("event", "name", "price", "quantity_available")


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ("user", "event_pass", "registered_at", "is_paid")
    list_filter = ("event_pass", "is_paid")


@admin.register(FestivalShuttleDeparture)
class FestivalShuttleDepartureAdmin(admin.ModelAdmin):
    list_display = ("edition", "day_label", "departure_time", "direction", "iso_date", "sort_order")
    list_filter = ("edition", "day_id", "direction")
    search_fields = ("day_label", "departure_time")


@admin.register(FestivalProgramSlot)
class FestivalProgramSlotAdmin(admin.ModelAdmin):
    list_display = ("edition", "day_label", "start_time", "end_time", "title", "room", "category", "level")
    list_filter = ("edition", "day_id", "room", "category", "level")
    search_fields = ("title", "style", "room")
    ordering = ("iso_date", "sort_order", "start_time")


class FestivalAnnouncementAdminForm(forms.ModelForm):
    """Ajoute la case 'envoyer en push' sans polluer le modèle."""

    send_push_now = forms.BooleanField(
        required=False,
        label="Envoyer en notification push maintenant",
        help_text=(
            "Notif spontanée : coche pour l’envoyer aux téléphones. "
            "Annonce / urgence : coche seulement si tu veux aussi alerter hors de l’app."
        ),
    )

    class Meta:
        model = FestivalAnnouncement
        exclude = ("priority",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance.pk:
            self.fields["send_push_now"].initial = False

    def clean(self):
        cleaned = super().clean()
        kind = cleaned.get("kind")
        link = (cleaned.get("link_url") or "").strip()
        if kind == FestivalAnnouncement.Kind.LINK and not link:
            self.add_error(
                "link_url",
                "Une annonce avec redirection doit avoir une URL (ex. /passes).",
            )
        return cleaned


@admin.register(FestivalAnnouncement)
class FestivalAnnouncementAdmin(admin.ModelAdmin):
    form = FestivalAnnouncementAdminForm
    list_display = (
        "title",
        "kind",
        "edition",
        "is_published",
        "link_url",
        "starts_at",
        "ends_at",
        "sort_order",
    )
    list_filter = ("kind", "is_published", "edition")
    search_fields = ("title", "body")
    ordering = ("-priority", "sort_order", "-created_at")
    actions = ("send_push_action",)
    fieldsets = (
        (
            "Type",
            {
                "fields": ("kind",),
                "description": (
                    "<ul>"
                    "<li><b>Notif spontanée</b> — comme les tests : téléphone uniquement, pas dans l’app.</li>"
                    "<li><b>Annonce avec redirection</b> — carte sur l’accueil, le clic ouvre une page.</li>"
                    "<li><b>Annonce sans redirection</b> — carte sur l’accueil, aucun lien.</li>"
                    "<li><b>Urgence</b> — bandeau en haut de toutes les pages.</li>"
                    "</ul>"
                ),
            },
        ),
        ("Contenu", {"fields": ("badge_label", "title", "body", "edition")}),
        (
            "Redirection",
            {
                "fields": ("link_url", "link_label"),
                "description": (
                    "Annonce avec redirection : obligatoire. "
                    "Urgence : optionnel — si rempli, le tap sur le bandeau ouvre le lien."
                ),
            },
        ),
        (
            "Publication",
            {
                "fields": (
                    "is_published",
                    "starts_at",
                    "ends_at",
                    "sort_order",
                    "send_push_now",
                ),
            },
        ),
    )

    @admin.action(description="Envoyer en notification push")
    def send_push_action(self, request, queryset):
        sent = 0
        failed = 0
        for announcement in queryset:
            stats = send_announcement_notification(announcement)
            sent += stats.get("sent", 0)
            failed += stats.get("failed", 0)
        self.message_user(
            request,
            f"Push envoyé : {sent} OK, {failed} échec(s).",
            messages.SUCCESS if failed == 0 else messages.WARNING,
        )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        send_now = form.cleaned_data.get("send_push_now")
        auto_push = (
            not change
            and obj.kind == FestivalAnnouncement.Kind.PUSH
            and obj.is_published
        )
        if send_now or auto_push:
            stats = send_announcement_notification(obj)
            self.message_user(
                request,
                f"Push envoyé : {stats.get('sent', 0)} OK, {stats.get('failed', 0)} échec(s).",
                messages.SUCCESS,
            )
        elif not change and obj.kind == FestivalAnnouncement.Kind.PUSH:
            self.message_user(
                request,
                "Cette notif spontanée n’apparaît pas dans l’app. "
                "Coche « Envoyer en notification push maintenant » ou utilise l’action de liste.",
                messages.WARNING,
            )


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ("token_short", "token_type", "platform", "device_label", "is_active", "last_used_at")
    list_filter = ("token_type", "platform", "is_active")
    search_fields = ("token", "endpoint", "device_label")
    readonly_fields = ("token", "endpoint", "created_at", "updated_at", "last_used_at")
    ordering = ("-last_used_at",)

    @admin.display(description="Token / Endpoint")
    def token_short(self, obj):
        value = obj.endpoint or obj.token
        return f"{value[:40]}..." if value else "-"
