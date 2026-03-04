"""
Permissions DRF réutilisables pour le projet Bachata V5.
"""
from rest_framework.permissions import BasePermission


class IsSuperUser(BasePermission):
    """
    Autorise uniquement les utilisateurs authentifiés et superuser (admin Django).
    Utilisé pour toutes les vues CRUD d'administration du contenu.
    Retourne 403 si l'utilisateur est connecté mais n'est pas superuser.
    Retourne 401 si l'utilisateur n'est pas connecté (géré par IsAuthenticated en amont).
    """
    message = "Réservé aux administrateurs."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )
