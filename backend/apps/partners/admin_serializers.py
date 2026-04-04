"""
Serializers admin (création) — staff / superuser.
"""
from rest_framework import serializers
from django.utils.text import slugify

from apps.core.models import DanceStyle, Level
from .models import Partner, PartnerNode, PartnerEvent, PartnerCourse


class PartnerAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = ("name", "slug", "description")

    def validate_slug(self, value):
        value = slugify(value) or value
        if Partner.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Ce slug existe déjà.")
        return value


class PartnerNodeAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerNode
        fields = (
            "name",
            "slug",
            "type",
            "description",
            "short_description",
            "content",
            "cta_text",
            "cta_url",
            "partner",
            "parent",
        )
        extra_kwargs = {
            "type": {"default": PartnerNode.NodeType.BRANCH},
            "cta_text": {"default": "En savoir plus"},
            "partner": {"required": True},
            "parent": {"required": False, "allow_null": True},
        }

    def validate_slug(self, value):
        value = slugify(value) or value
        if PartnerNode.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Ce slug est déjà utilisé pour une structure.")
        return value


class PartnerEventAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerEvent
        fields = (
            "name",
            "slug",
            "type",
            "description",
            "start_date",
            "end_date",
            "location_name",
            "partner",
            "node",
        )
        extra_kwargs = {
            "partner": {"required": True},
            "node": {"required": False, "allow_null": True},
            "description": {"default": ""},
            "location_name": {"default": ""},
        }

    def validate_slug(self, value):
        value = slugify(value) or value
        if PartnerEvent.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Ce slug est déjà utilisé pour un événement.")
        return value

    def validate(self, attrs):
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "La date de fin doit être après le début."})
        return attrs


class PartnerCourseAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerCourse
        fields = (
            "name",
            "slug",
            "description",
            "style",
            "level",
            "partner",
            "node",
            "is_active",
        )
        extra_kwargs = {
            "partner": {"required": True},
            "node": {"required": False, "allow_null": True},
            "description": {"default": ""},
            "is_active": {"default": True},
        }

    def validate_slug(self, value):
        value = slugify(value) or value
        if PartnerCourse.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Ce slug est déjà utilisé pour un cours.")
        return value


class DanceStyleMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DanceStyle
        fields = ("id", "name", "slug")


class LevelMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ("id", "name", "slug")
