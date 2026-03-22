from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.organization.models import OrganizationRole

User = get_user_model()

class DanceProfessionSerializer(serializers.ModelSerializer):
    class Meta:
        from apps.core.models import DanceProfession
        model = DanceProfession
        fields = ['id', 'name', 'slug']

class ArtistSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'affichage public d'un artiste.
    """
    professions = DanceProfessionSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'bio', 'bio_en', 'bio_es', 'profile_picture', 'professions', 'is_staff_member'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        pic = data.get("profile_picture")
        if pic and request and not str(pic).startswith("http"):
            data["profile_picture"] = request.build_absolute_uri(pic)
        return data

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'inscription d'un nouvel utilisateur.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user
