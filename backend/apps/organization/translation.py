from modeltranslation.translator import register, TranslationOptions

from .models import (
    NodeEvent,
    OrganizationNode,
    OrganizationRole,
    Pole,
    TeamMember,
)


@register(Pole)
class PoleTranslationOptions(TranslationOptions):
    fields = ("name",)


@register(OrganizationNode)
class OrganizationNodeTranslationOptions(TranslationOptions):
    fields = (
        "name",
        "description",
        "short_description",
        "content",
        "cta_text",
    )


@register(OrganizationRole)
class OrganizationRoleTranslationOptions(TranslationOptions):
    fields = ("name", "description")


@register(NodeEvent)
class NodeEventTranslationOptions(TranslationOptions):
    fields = ("title", "description", "location")


@register(TeamMember)
class TeamMemberTranslationOptions(TranslationOptions):
    fields = ("name", "role", "bio")

