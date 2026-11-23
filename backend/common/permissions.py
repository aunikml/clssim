from rest_framework import permissions

class IsFacilitatorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow facilitators to edit objects.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # If obj has facilitator attribute directly
        if hasattr(obj, 'facilitator'):
            return obj.facilitator == request.user
        # If obj has session attribute
        if hasattr(obj, 'session') and hasattr(obj.session, 'facilitator'):
            return obj.session.facilitator == request.user
        return False

class IsSessionMember(permissions.BasePermission):
    """
    Allows access only to active participants of a session or its facilitator.
    """
    def has_object_permission(self, request, view, obj):
        session = getattr(obj, 'session', obj)
        if session.facilitator == request.user:
            return True
        return session.participants.filter(user=request.user, is_connected=True).exists()
