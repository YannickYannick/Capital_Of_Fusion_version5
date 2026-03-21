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


class IsSuperUserOrAdminType(permissions.BasePermission):
    """
    Superuser Django OU compte avec user_type ADMIN (aligné sur SiteConfigurationAdminAPIView).
    """
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        if getattr(u, "is_superuser", False):
            return True
        return getattr(u, "user_type", None) == "ADMIN"
