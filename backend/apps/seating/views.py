from django.db import transaction
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.sessions.models import ClassroomSession, SessionParticipant
from .models import ClassroomSeat, SessionSeatReservation
from .serializers import SessionSeatStatusSerializer
from apps.realtime.events import broadcast_session_event

class SessionSeatListView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, session_id):
        try:
            session = ClassroomSession.objects.select_related('classroom').get(id=session_id)
        except ClassroomSession.DoesNotExist:
            return Response({'error': 'Classroom session not found'}, status=status.HTTP_404_NOT_FOUND)

        seats = ClassroomSeat.objects.filter(classroom=session.classroom, is_active=True).prefetch_related('reservations__participant__user')
        serializer = SessionSeatStatusSerializer(seats, many=True, context={'session': session})
        return Response({
            'session_id': str(session.id),
            'classroom_id': str(session.classroom.id),
            'total_seats': seats.count(),
            'seats': serializer.data
        })

class SessionSeatReserveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        seat_identifier = request.data.get('seat_identifier')
        if not seat_identifier:
            return Response({'error': 'seat_identifier is required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            try:
                session = ClassroomSession.objects.select_for_update().get(id=session_id)
            except ClassroomSession.DoesNotExist:
                return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

            # Ensure user is a participant of this session
            participant, _ = SessionParticipant.objects.get_or_create(
                session=session,
                user=request.user,
                defaults={'role': 'student', 'is_connected': True}
            )

            # Look up the seat
            try:
                seat = ClassroomSeat.objects.select_for_update().get(
                    classroom=session.classroom,
                    seat_identifier=seat_identifier,
                    is_active=True
                )
            except ClassroomSeat.DoesNotExist:
                return Response({'error': f'Seat {seat_identifier} does not exist in this classroom'}, status=status.HTTP_404_NOT_FOUND)

            # Check if this seat is already reserved by someone else
            existing_seat_reservation = SessionSeatReservation.objects.select_for_update().filter(
                session=session,
                seat=seat
            ).first()

            if existing_seat_reservation:
                if existing_seat_reservation.participant == participant:
                    return Response({
                        'seat_id': seat.seat_identifier,
                        'participant_id': str(participant.id),
                        'status': 'occupied',
                        'message': 'You have already reserved this seat.'
                    }, status=status.HTTP_200_OK)
                return Response({
                    'error': f'Seat {seat_identifier} is already occupied by another participant.'
                }, status=status.HTTP_409_CONFLICT)

            # Check if participant already has another seat in this session:
            # If so, release the old seat and move to the new seat
            old_reservation = SessionSeatReservation.objects.select_for_update().filter(
                session=session,
                participant=participant
            ).first()

            old_seat_id = None
            if old_reservation:
                old_seat_id = old_reservation.seat.seat_identifier
                old_reservation.delete()
                broadcast_session_event(
                    session_id=session.id,
                    event_type='seat.released',
                    payload={
                        'seat_id': old_seat_id,
                        'status': 'available'
                    },
                    participant_id=participant.id
                )

            # Create new reservation
            new_reservation = SessionSeatReservation.objects.create(
                session=session,
                seat=seat,
                participant=participant
            )

            broadcast_session_event(
                session_id=session.id,
                event_type='seat.reserved',
                payload={
                    'seat_id': seat.seat_identifier,
                    'participant_id': str(participant.id),
                    'username': participant.user.username,
                    'display_name': getattr(participant.user.participant_profile, 'display_name', participant.user.username),
                    'status': 'occupied'
                },
                participant_id=participant.id
            )

            return Response({
                'seat_id': seat.seat_identifier,
                'participant_id': str(participant.id),
                'username': participant.user.username,
                'status': 'occupied',
                'previous_seat_released': old_seat_id
            }, status=status.HTTP_200_OK)

class SessionSeatReleaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        with transaction.atomic():
            try:
                session = ClassroomSession.objects.select_for_update().get(id=session_id)
            except ClassroomSession.DoesNotExist:
                return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

            participant = SessionParticipant.objects.filter(session=session, user=request.user).first()
            if not participant:
                return Response({'error': 'Participant not found in session'}, status=status.HTTP_404_NOT_FOUND)

            reservation = SessionSeatReservation.objects.select_for_update().filter(
                session=session,
                participant=participant
            ).first()

            if not reservation:
                return Response({'message': 'No seat currently reserved to release'}, status=status.HTTP_200_OK)

            seat_identifier = reservation.seat.seat_identifier
            reservation.delete()

            broadcast_session_event(
                session_id=session.id,
                event_type='seat.released',
                payload={
                    'seat_id': seat_identifier,
                    'status': 'available'
                },
                participant_id=participant.id
            )

            return Response({
                'message': f'Seat {seat_identifier} released successfully',
                'seat_id': seat_identifier,
                'status': 'available'
            }, status=status.HTTP_200_OK)
