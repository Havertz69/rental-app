from rest_framework.permissions import BasePermission


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission:
    - Allow access if the user is staff (admin/landlord)
    - Or the owning/related user on the object.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Staff users (admins/landlords) can access all related objects
        if user.is_staff:
            return True

        # Generic owner check: object may have `owner` or `user` attribute
        owner = getattr(obj, "owner", None)
        if owner is not None:
            return owner == user

        tenant_user = getattr(obj, "user", None)
        if tenant_user is not None:
            return tenant_user == user

        # Fallback: deny
        return False


class IsStaffUser(BasePermission):
    """
    View-level permission for staff users (admins/landlords).
    Uses Django's built-in `is_staff` flag.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_staff)


class IsSuperAdmin(BasePermission):
    """
    View-level permission for system administrators (superusers).
    This is stricter than `IsStaffUser` and is intended for
    high-privilege operations like creating other admins.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_superuser)

