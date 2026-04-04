"""
Vues API Users — auth (login/logout, Google OAuth), utilisateur courant, et inscription.
"""
import logging
import os
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from django.contrib.auth import authenticate

logger = logging.getLogger(__name__)

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from apps.core.models import DanceProfession, PendingContentEdit
from apps.core.api_response import json_response_no_store
from apps.core.permissions import IsStaffOrSuperUser

from .models import User
from .serializers import (
    ArtistSerializer,
    RegisterSerializer,
    DanceProfessionSerializer,
    ArtistCreateSerializer,
)


class LoginAPIView(APIView):
    """
    POST /api/auth/login/
    Body: { "username", "password" } -> { "token" }.
    Crée ou récupère le token pour l'utilisateur.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response(
                {"error": "username et password requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(request, username=username, password=password)
        if not user:
            return Response(
                {"error": "Identifiants incorrects"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        # Bloquer les comptes en attente de validation
        if getattr(user, "account_status", "APPROVED") == "PENDING":
            return Response(
                {"error": "Votre compte est en attente de validation par un administrateur."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if getattr(user, "account_status", "APPROVED") == "REJECTED":
            return Response(
                {"error": "Votre demande a été refusée. Contactez l'administration."},
                status=status.HTTP_403_FORBIDDEN,
            )
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})


class GoogleLoginAPIView(APIView):
    """
    POST /api/auth/google/
    Body: { "id_token": "<Google JWT id_token>" } -> { "token": "<api token>" }.
    Vérifie le id_token auprès de Google, crée ou récupère le User par email, retourne le token API (même format que login).
    Variable d'env : GOOGLE_OAUTH_CLIENT_ID (Client ID Web de la console Google).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_raw = request.data.get("id_token")
        if not id_token_raw:
            return Response(
                {"error": "id_token requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
        if not client_id:
            return Response(
                {"error": "Connexion Google non configurée"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_raw, google_requests.Request(), client_id
            )
        except ValueError:
            return Response(
                {"error": "Token Google invalide ou expiré"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        email = idinfo.get("email")
        if not email or not idinfo.get("email_verified", True):
            return Response(
                {"error": "Email Google non disponible"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        first_name = idinfo.get("given_name") or ""
        last_name = idinfo.get("family_name") or ""
        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_user(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            user.set_unusable_password()
            user.save()
        else:
            updated = []
            if first_name and not user.first_name:
                user.first_name = first_name
                updated.append("first_name")
            if last_name and not user.last_name:
                user.last_name = last_name
                updated.append("last_name")
            if updated:
                user.save(update_fields=updated)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})


class LogoutAPIView(APIView):
    """
    POST /api/auth/logout/
    Supprime le token côté serveur (déconnexion réelle).
    Header: Authorization: Token <key>
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeAPIView(APIView):
    """
    GET /api/auth/me/
    Utilisateur courant avec rôle (ADMIN / STAFF / MEMBER).
    Header: Authorization: Token <key>
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": str(user.pk),
            "username": user.username,
            "email": user.email or "",
            "first_name": user.first_name or "",
            "last_name": user.last_name or "",
            "is_vibe": getattr(user, "is_vibe", False),
            "user_type": getattr(user, "user_type", "MEMBER"),
            "staff_role": getattr(user, "staff_role", "") or "",
            "account_status": getattr(user, "account_status", "APPROVED"),
        })

class ArtistListAPIView(APIView):
    """
    GET /api/users/artists/
    Liste publique des artistes (utilisateurs ayant des professions).
    Pas de cache ici : LocMemCache + plusieurs workers Gunicorn faisait servir
    d'anciennes URLs (ex. /media/media/...) après upload tant qu'un worker
    n'avait pas été invalidé.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        staff_only = request.query_params.get('staff_only')

        artists = (
            User.objects.filter(professions__isnull=False)
            .distinct()
            .select_related("dance_level")
            .prefetch_related("professions")
        )

        if staff_only == 'true':
            artists = artists.filter(is_staff_member=True)
        elif staff_only == 'false':
            artists = artists.filter(is_staff_member=False)

        serializer = ArtistSerializer(artists, many=True, context={'request': request})
        return json_response_no_store(serializer.data)


class ArtistDetailAPIView(APIView):
    """
    GET /api/users/artists/<username>/
    Détail public d'un artiste.
    """
    permission_classes = [AllowAny]

    def get(self, request, username):
        artist = (
            User.objects.filter(username=username, professions__isnull=False)
            .select_related("dance_level")
            .prefetch_related("professions")
            .first()
        )
        if artist:
            serializer = ArtistSerializer(artist, context={'request': request})
            return Response(serializer.data)
        else:
            return Response(
                {"error": "Artiste non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )


class ArtistAdminDetailAPIView(APIView):
    """
    GET /api/admin/users/artists/<username>/ — détail + liste des professions (staff/admin).
    PATCH — mise à jour : prénom, nom, bio, membre CoF, professions.
    """

    permission_classes = [IsStaffOrSuperUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, username):
        artist = User.objects.filter(username=username).first()
        if not artist:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)
        profs = DanceProfession.objects.all().order_by("name")
        return json_response_no_store(
            {
                "artist": ArtistSerializer(artist, context={"request": request}).data,
                "all_professions": DanceProfessionSerializer(profs, many=True).data,
            }
        )

    def patch(self, request, username):
        artist = User.objects.filter(username=username).first()
        if not artist:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        if "first_name" in request.data:
            artist.first_name = str(request.data["first_name"] or "")
        if "last_name" in request.data:
            artist.last_name = str(request.data["last_name"] or "")
        if "bio" in request.data:
            artist.bio = str(request.data["bio"] or "")
        if "bio_en" in request.data:
            artist.bio_en = str(request.data["bio_en"] or "")
        if "bio_es" in request.data:
            artist.bio_es = str(request.data["bio_es"] or "")
        if "is_staff_member" in request.data:
            artist.is_staff_member = bool(request.data["is_staff_member"])

        if "profession_ids" in request.data:
            raw = request.data["profession_ids"]
            if isinstance(raw, list):
                qs = DanceProfession.objects.filter(id__in=raw)
                artist.professions.set(qs)
            elif raw is None:
                artist.professions.clear()

        if "profile_picture" in request.FILES:
            artist.profile_picture = request.FILES["profile_picture"]
            logger.info(f"[UPLOAD] profile_picture assigned: {artist.profile_picture.name}")
        if "cover_image" in request.FILES:
            artist.cover_image = request.FILES["cover_image"]
            logger.info(f"[UPLOAD] cover_image assigned: {artist.cover_image.name}")

        try:
            artist.save()
            # Log storage info after save
            if artist.profile_picture:
                storage_class = artist.profile_picture.storage.__class__.__name__
                logger.info(f"[UPLOAD] profile_picture after save: {artist.profile_picture.name}, storage: {storage_class}")
        except Exception as e:
            logger.exception("ArtistAdminDetailAPIView.patch save failed")
            return Response(
                {
                    "error": "Échec de l'enregistrement (upload ou stockage).",
                    "detail": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            ArtistSerializer(artist, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class ArtistAdminListCreateAPIView(APIView):
    """
    POST /api/admin/users/artists/
    Création d'un artiste (profil public). ADMIN : direct. STAFF : en attente (PendingContentEdit).
    """
    permission_classes = [IsStaffOrSuperUser]

    def post(self, request):
        serializer = ArtistCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if getattr(request.user, "user_type", None) == "ADMIN" or getattr(request.user, "is_superuser", False):
            user = serializer.save()
            return Response(
                ArtistSerializer(user, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )

        # JSONField stocke via sérialisation; on s'assure que les UUID sont en string.
        pending_payload = dict(serializer.validated_data)
        if "profession_ids" in pending_payload and isinstance(pending_payload["profession_ids"], list):
            pending_payload["profession_ids"] = [str(v) for v in pending_payload["profession_ids"]]

        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.USER_ARTIST_CREATE,
            object_id="",
            payload=pending_payload,
            requested_by=request.user,
        )
        return Response(
            {
                "message": "Création enregistrée. Elle sera visible après approbation par un administrateur.",
                "pending": True,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class DanceProfessionAdminListAPIView(APIView):
    """
    GET /api/admin/users/artists/professions/
    Liste des professions de danse (pour les formulaires admin côté frontend).
    """
    permission_classes = [IsStaffOrSuperUser]

    def get(self, request):
        profs = DanceProfession.objects.all().order_by("name")
        return Response(DanceProfessionSerializer(profs, many=True).data, status=status.HTTP_200_OK)


class RegisterAPIView(APIView):
    """
    POST /api/auth/register/
    Création d'un compte Membre.
    Body: { username, email, password, first_name?, last_name? }
    Retourne un token d'auth directement après l'inscription.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        is_pending = user.account_status == "PENDING"
        # On ne retourne un token que si le compte est actif
        token_key = None
        if not is_pending:
            token, _ = Token.objects.get_or_create(user=user)
            token_key = token.key
        return Response(
            {
                "token": token_key,
                "account_status": user.account_status,
                "user": {
                    "id": str(user.pk),
                    "username": user.username,
                    "email": user.email,
                    "user_type": user.user_type,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class PendingStaffAPIView(APIView):
    """
    GET  /api/auth/pending-staff/  → liste des comptes Staff en attente (Admin only).
    PATCH /api/auth/pending-staff/<id>/ → approuver ou refuser (Admin only).
    Body PATCH: { "action": "approve" | "reject" }
    """
    permission_classes = [IsAuthenticated]

    def _require_admin(self, user):
        if not getattr(user, "is_superuser", False):
            return Response(
                {"error": "Réservé aux administrateurs."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def get(self, request):
        err = self._require_admin(request.user)
        if err:
            return err
        pending = User.objects.filter(user_type="STAFF", account_status="PENDING")
        data = [
            {
                "id": u.pk,
                "username": u.username,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "staff_role": u.staff_role,
                "date_joined": u.date_joined,
            }
            for u in pending
        ]
        return Response(data)

    def patch(self, request, user_id):
        err = self._require_admin(request.user)
        if err:
            return err
        action = request.data.get("action")  # "approve" | "reject"
        try:
            user = User.objects.get(pk=user_id, user_type="STAFF")
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND)
        if action == "approve":
            user.account_status = "APPROVED"
            user.is_active = True
            user.save()
            return Response({"status": "approved", "username": user.username})
        elif action == "reject":
            user.account_status = "REJECTED"
            user.save()
            return Response({"status": "rejected", "username": user.username})
        return Response({"error": "action doit être 'approve' ou 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
