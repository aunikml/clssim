from rest_framework import serializers
from .models import Classroom
from apps.seating.models import ClassroomSeat

class ClassroomSerializer(serializers.ModelSerializer):
    seat_count = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = (
            'id', 'name', 'description', 'environment_type',
            'width', 'length', 'wall_height', 'configuration',
            'is_active', 'seat_count', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_seat_count(self, obj):
        return obj.seats.count()

    def create(self, validated_data):
        classroom = super().create(validated_data)
        ClassroomSeat.generate_seats_for_classroom(classroom)
        return classroom
