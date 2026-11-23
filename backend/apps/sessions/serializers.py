from rest_framework import serializers
from .models import ClassroomSession, SessionParticipant
from apps.classrooms.serializers import ClassroomSerializer
from apps.accounts.serializers import UserSerializer

class SessionParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    seat_identifier = serializers.SerializerMethodField()

    class Meta:
        model = SessionParticipant
        fields = ('id', 'user', 'role', 'is_connected', 'seat_identifier', 'joined_at', 'last_active_at')

    def get_seat_identifier(self, obj):
        res = obj.seat_reservation.first()
        return res.seat.seat_identifier if res else None

class ClassroomSessionSerializer(serializers.ModelSerializer):
    classroom_detail = ClassroomSerializer(source='classroom', read_only=True)
    facilitator_detail = UserSerializer(source='facilitator', read_only=True)
    participants = SessionParticipantSerializer(many=True, read_only=True)
    participant_count = serializers.SerializerMethodField()
    active_teacher = serializers.SerializerMethodField()

    class Meta:
        model = ClassroomSession
        fields = (
            'id', 'title', 'classroom', 'classroom_detail',
            'facilitator', 'facilitator_detail', 'status',
            'scheduled_start', 'actual_start', 'actual_end',
            'max_participants', 'settings', 'participants',
            'participant_count', 'active_teacher',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'facilitator', 'actual_start', 'actual_end', 'created_at', 'updated_at')

    def get_participant_count(self, obj):
        return obj.participants.filter(is_connected=True).count()

    def get_active_teacher(self, obj):
        teacher = obj.participants.filter(role='teacher', is_connected=True).first()
        if teacher:
            return {
                'id': str(teacher.id),
                'user_id': str(teacher.user.id),
                'username': teacher.user.username,
                'display_name': getattr(teacher.user.participant_profile, 'display_name', teacher.user.username)
            }
        return None
