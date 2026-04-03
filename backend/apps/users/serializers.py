from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.organization.models import OrganizationRole
from apps.core.models import DanceProfession

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
            'bio', 'bio_en', 'bio_es', 'profile_picture', 'cover_image', 'professions', 'is_staff_member'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        for key in ("profile_picture", "cover_image"):
            val = data.get(key)
            if val and request and not str(val).startswith("http"):
                data[key] = request.build_absolute_uri(val)
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


class ArtistCreateSerializer(serializers.Serializer):
    """
    Serializer de création d'artiste (profil public sans credentials).
    """
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    bio_en = serializers.CharField(required=False, allow_blank=True)
    bio_es = serializers.CharField(required=False, allow_blank=True)
    is_staff_member = serializers.BooleanField(required=False, default=False)
    profession_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        allow_empty=True,
    )

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce username existe déjà.")
        return value

    def create(self, validated_data):
        profession_ids = validated_data.pop("profession_ids", [])
        user = User(
            username=validated_data["username"].strip(),
            first_name=validated_data.get("first_name", "").strip(),
            last_name=validated_data.get("last_name", "").strip(),
            bio=validated_data.get("bio", "").strip(),
            bio_en=validated_data.get("bio_en", "").strip(),
            bio_es=validated_data.get("bio_es", "").strip(),
            is_staff_member=bool(validated_data.get("is_staff_member", False)),
            user_type=User.UserType.MEMBER,
            account_status=User.AccountStatus.APPROVED,
            is_active=True,
        )
        user.set_unusable_password()
        user.save()
        if profession_ids:
            professions = DanceProfession.objects.filter(id__in=profession_ids)
            user.professions.set(professions)
        return user
