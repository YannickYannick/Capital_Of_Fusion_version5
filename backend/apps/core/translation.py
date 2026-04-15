from modeltranslation.translator import register, TranslationOptions

from .models import Bulletin, DanceProfession, DanceStyle, Level, MenuItem, SiteConfiguration


@register(DanceStyle)
class DanceStyleTranslationOptions(TranslationOptions):
    fields = ("name", "description")


@register(Level)
class LevelTranslationOptions(TranslationOptions):
    fields = ("name", "description")


@register(DanceProfession)
class DanceProfessionTranslationOptions(TranslationOptions):
    fields = ("name", "description")


@register(SiteConfiguration)
class SiteConfigurationTranslationOptions(TranslationOptions):
    fields = (
        "site_name",
        "hero_title",
        "hero_subtitle",
        "hero_top_text",
        "hero_descr_1",
        "hero_descr_2",
        "hero_btn_1_text",
        "hero_btn_2_text",
        "hero_footer_text",
        "vision_markdown",
        "history_markdown",
        "festival_planning_navettes_markdown",
        "festival_acces_venue_markdown",
        "festival_jack_n_jill_markdown",
        "festival_all_star_street_battle_markdown",
        "festival_book_your_hotel_markdown",
        "festival_notre_programme_markdown",
        "support_faq_markdown",
        "support_contact_markdown",
    )


@register(MenuItem)
class MenuItemTranslationOptions(TranslationOptions):
    fields = ("name",)


@register(Bulletin)
class BulletinTranslationOptions(TranslationOptions):
    fields = ("title", "content_markdown")

