from rest_framework.permissions import BasePermission

class IsOwnerOrAdmin(BasePermission):
    """Allow access if user is staff or the owner/related user."""
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        # Generic check: object may have owner or user attribute
        owner = getattr(obj, 'owner', None)
        if owner is not None:
            return owner == user
        tenant_user = getattr(obj, 'user', None)
        if tenant_user is not None:
            return tenant_user == user
        # fallback: deny
        return False
