"""
Vues API Users — auth (login/logout, Google OAuth) et utilisateur courant.
"""
import os
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import User
from .serializers import ArtistSerializer


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
    Utilisateur courant (si authentifié).
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
        })

class ArtistListAPIView(APIView):
    """
    GET /api/users/artists/
    Liste publique des artistes (utilisateurs ayant des professions).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # On filtre les utilisateurs qui ont au moins une profession définie
        artists = User.objects.filter(professions__isnull=False).distinct()
        serializer = ArtistSerializer(artists, many=True, context={'request': request})
        return Response(serializer.data)

class ArtistDetailAPIView(APIView):
    """
    GET /api/users/artists/<username>/
    Détail public d'un artiste.
    """
    permission_classes = [AllowAny]

    def get(self, request, username):
        # Utilisation de filter().distinct().first() pour éviter MultipleObjectsReturned 
        # si l'artiste a plusieurs professions (ex: Professeur + DJ)
        artist = User.objects.filter(username=username, professions__isnull=False).distinct().first()
        if artist:
            serializer = ArtistSerializer(artist, context={'request': request})
            return Response(serializer.data)
        else:
            return Response(
                {"error": "Artiste non trouvé"}, 
                status=status.HTTP_404_NOT_FOUND
            )
