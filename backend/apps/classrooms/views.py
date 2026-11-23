from rest_framework import viewsets, permissions
from .models import Classroom
from .serializers import ClassroomSerializer
from apps.seating.models import ClassroomSeat

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ClassroomSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        classroom = serializer.save()
        ClassroomSeat.generate_seats_for_classroom(classroom)
