from rest_framework import serializers
from .models import ClassroomSeat, SessionSeatReservation

class ClassroomSeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassroomSeat
        fields = (
            'id', 'seat_identifier', 'row_number', 'column_number',
            'position_x', 'position_y', 'position_z', 'rotation', 'is_active', 'metadata'
        )

class SessionSeatStatusSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    occupied_by = serializers.SerializerMethodField()

    class Meta:
        model = ClassroomSeat
        fields = (
            'id', 'seat_identifier', 'row_number', 'column_number',
            'position_x', 'position_y', 'position_z', 'rotation',
            'status', 'occupied_by'
        )

    def get_status(self, obj):
        session = self.context.get('session')
        if not session:
            return 'available'
        has_reservation = obj.reservations.filter(session=session).exists()
        return 'occupied' if has_reservation else 'available'

    def get_occupied_by(self, obj):
        session = self.context.get('session')
        if not session:
            return None
        res = obj.reservations.filter(session=session).select_related('participant__user').first()
        if res:
            p = res.participant
            return {
                'participant_id': str(p.id),
                'username': p.user.username,
                'display_name': getattr(p.user.participant_profile, 'display_name', p.user.username),
                'role': p.role,
                'reserved_at': res.reserved_at.isoformat()
            }
        return None
