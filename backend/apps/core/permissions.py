from rest_framework import permissions

class IsSuperUser(permissions.BasePermission):
    """
    Permission permettant l'accès uniquement aux superutilisateurs.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class IsStaffOrSuperUser(permissions.BasePermission):
    """
    Permission pour les membres du staff ou superutilisateurs (ex: modifier descriptions planètes depuis /explore).
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )
