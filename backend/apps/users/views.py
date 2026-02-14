"""
Vues API Users — auth (login/logout) et utilisateur courant.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate

from .models import User


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
