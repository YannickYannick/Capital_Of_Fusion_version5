from modeltranslation.translator import register, TranslationOptions

from .models import Event, EventPass


@register(Event)
class EventTranslationOptions(TranslationOptions):
    fields = ("name", "description", "location_name")


@register(EventPass)
class EventPassTranslationOptions(TranslationOptions):
    fields = ("name",)

