from django.utils import timezone
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ClassroomSession, SessionParticipant
from .serializers import ClassroomSessionSerializer, SessionParticipantSerializer
from apps.realtime.events import broadcast_session_event
import os
from common.livekit import generate_livekit_token

class ClassroomSessionViewSet(viewsets.ModelViewSet):
    queryset = ClassroomSession.objects.all().order_by('-created_at')
    serializer_class = ClassroomSessionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        session = serializer.save(facilitator=self.request.user)
        # Facilitator automatically joins with facilitator role
        SessionParticipant.objects.create(
            session=session,
            user=self.request.user,
            role='facilitator',
            is_connected=True
        )

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        session = self.get_object()
        role = request.data.get('role', 'student')
        if role not in ('teacher', 'student', 'facilitator'):
            role = 'student'

        # If trying to join as facilitator, only the session facilitator can
        if role == 'facilitator' and session.facilitator != request.user:
            role = 'student'

        # If joining as teacher, check if there's already an active teacher
        if role == 'teacher':
            existing_teacher = session.participants.filter(role='teacher', is_connected=True).exclude(user=request.user).first()
            if existing_teacher:
                return Response(
                    {'error': f"Seat for active teacher is already occupied by {existing_teacher.user.username}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        participant, created = SessionParticipant.objects.get_or_create(
            session=session,
            user=request.user,
            defaults={'role': role, 'is_connected': True}
        )

        if not created:
            participant.is_connected = True
            participant.last_active_at = timezone.now()
            participant.save(update_fields=['is_connected', 'last_active_at'])

        broadcast_session_event(
            session_id=session.id,
            event_type='participant.joined',
            payload={
                'participant_id': str(participant.id),
                'username': participant.user.username,
                'role': participant.role,
                'is_connected': True
            },
            participant_id=participant.id
        )

        return Response(SessionParticipantSerializer(participant).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        session = self.get_object()
        participant = session.participants.filter(user=request.user).first()
        if not participant:
            return Response({'error': 'You are not a participant in this session'}, status=status.HTTP_404_NOT_FOUND)

        participant.is_connected = False
        participant.left_at = timezone.now()
        participant.save(update_fields=['is_connected', 'left_at'])

        broadcast_session_event(
            session_id=session.id,
            event_type='participant.left',
            payload={
                'participant_id': str(participant.id),
                'username': participant.user.username
            },
            participant_id=participant.id
        )

        return Response({'message': 'Successfully left session'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='assign-role')
    def assign_role(self, request, pk=None):
        session = self.get_object()
        # Only facilitator can reassign roles
        if session.facilitator != request.user and not request.user.is_staff:
            return Response({'error': 'Only session facilitator can assign roles'}, status=status.HTTP_403_FORBIDDEN)

        target_user_id = request.data.get('user_id')
        new_role = request.data.get('role')

        if new_role not in ('teacher', 'student', 'facilitator'):
            return Response({'error': f"Invalid role: {new_role}"}, status=status.HTTP_400_BAD_REQUEST)

        participant = session.participants.filter(user__id=target_user_id).first()
        if not participant:
            return Response({'error': 'Target participant not found in this session'}, status=status.HTTP_404_NOT_FOUND)

        # If assigning as teacher, demote any previous teacher to student
        if new_role == 'teacher':
            session.participants.filter(role='teacher').exclude(id=participant.id).update(role='student')

        participant.role = new_role
        participant.save(update_fields=['role'])

        broadcast_session_event(
            session_id=session.id,
            event_type='role.changed',
            payload={
                'participant_id': str(participant.id),
                'user_id': str(participant.user.id),
                'username': participant.user.username,
                'new_role': new_role
            },
            participant_id=participant.id
        )

        return Response(SessionParticipantSerializer(participant).data)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        session = self.get_object()
        if session.facilitator != request.user and not request.user.is_staff:
            return Response({'error': 'Only facilitator can start session'}, status=status.HTTP_403_FORBIDDEN)

        session.status = 'active'
        if not session.actual_start:
            session.actual_start = timezone.now()
        session.save(update_fields=['status', 'actual_start'])

        broadcast_session_event(
            session_id=session.id,
            event_type='session.started',
            payload={'status': session.status, 'actual_start': session.actual_start.isoformat()}
        )
        return Response(ClassroomSessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        session = self.get_object()
        if session.facilitator != request.user and not request.user.is_staff:
            return Response({'error': 'Only facilitator can pause session'}, status=status.HTTP_403_FORBIDDEN)

        session.status = 'paused'
        session.save(update_fields=['status'])

        broadcast_session_event(
            session_id=session.id,
            event_type='session.paused',
            payload={'status': session.status}
        )
        return Response(ClassroomSessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        if session.facilitator != request.user and not request.user.is_staff:
            return Response({'error': 'Only facilitator can complete session'}, status=status.HTTP_403_FORBIDDEN)

        session.status = 'completed'
        session.actual_end = timezone.now()
        session.save(update_fields=['status', 'actual_end'])

        broadcast_session_event(
            session_id=session.id,
            event_type='session.completed',
            payload={'status': session.status, 'actual_end': session.actual_end.isoformat()}
        )
        return Response(ClassroomSessionSerializer(session).data)

    @action(detail=True, methods=['post'], url_path='livekit-token', permission_classes=[permissions.IsAuthenticated])
    def livekit_token(self, request, pk=None):
        session = self.get_object()
        participant = session.participants.filter(user=request.user).first()
        seat_res = participant.seat_reservation.first() if participant else None

        profile = getattr(request.user, 'participant_profile', None)
        metadata = {
            'role': participant.role if participant else 'student',
            'seat_id': seat_res.seat.seat_identifier if seat_res else None,
            'avatar_identifier': getattr(profile, 'avatar_identifier', 'default'),
            'display_name': getattr(profile, 'display_name', request.user.username),
        }

        token = generate_livekit_token(
            room_name=f"session_{session.id}",
            identity=request.user.username,
            name=metadata['display_name'],
            metadata=metadata
        )

        return Response({
            'token': token,
            'url': os.getenv('LIVEKIT_URL', 'wss://livekit.classsim.local'),
            'room_name': f"session_{session.id}",
            'participant_identity': request.user.username,
            'metadata': metadata,
        })
