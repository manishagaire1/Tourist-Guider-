from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Object-level permission: safe methods for anyone the view already
    allows in; writes only for the object's owner (`obj.user`)."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
