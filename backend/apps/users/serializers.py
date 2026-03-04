from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class ArtistSerializer(serializers.ModelSerializer):
    """Profil public d'un artiste."""
    profile_picture = serializers.SerializerMethodField()
    professions = serializers.StringRelatedField(many=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name",
            "bio", "profile_picture", "professions", "is_vibe",
            "user_type", "staff_role",
        ]

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class RegisterSerializer(serializers.Serializer):
    """Inscription — Membre (actif immédiatement) ou Staff (en attente d'approbation)."""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(max_length=150, required=False, default="")
    last_name = serializers.CharField(max_length=150, required=False, default="")
    user_type = serializers.ChoiceField(
        choices=["MEMBER", "STAFF"],
        required=False,
        default="MEMBER",
    )
    staff_role = serializers.ChoiceField(
        choices=["TEACHER", "ORGANIZER", "ARTIST", "CARE", "SHOP", "COMMUNICATIONS"],
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate(self, attrs):
        if attrs.get("user_type") == "STAFF" and not attrs.get("staff_role"):
            raise serializers.ValidationError({"staff_role": "Un rôle est requis pour s'inscrire en tant que Staff."})
        return attrs

    def create(self, validated_data):
        user_type = validated_data.get("user_type", "MEMBER")
        # Staff → PENDING, Membre → APPROVED
        account_status = "PENDING" if user_type == "STAFF" else "APPROVED"
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            user_type=user_type,
            staff_role=validated_data.get("staff_role", ""),
            account_status=account_status,
        )
        return user
