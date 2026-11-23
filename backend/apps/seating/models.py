import uuid
from django.db import models
from apps.classrooms.models import Classroom
from apps.sessions.models import ClassroomSession, SessionParticipant

class ClassroomSeat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='seats')
    seat_identifier = models.CharField(max_length=20)
    row_number = models.PositiveIntegerField()
    column_number = models.PositiveIntegerField()
    position_x = models.FloatField()
    position_y = models.FloatField(default=0.0)
    position_z = models.FloatField()
    rotation = models.FloatField(default=0.0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ('classroom', 'seat_identifier')
        ordering = ['row_number', 'column_number']

    def __str__(self):
        return f"{self.classroom.name} - Seat {self.seat_identifier}"

    @classmethod
    def generate_seats_for_classroom(cls, classroom):
        """Programmatically generate seating layout based on classroom configuration."""
        seating_cfg = classroom.configuration.get('seating', {})
        rows = seating_cfg.get('rows', 4)
        cols = seating_cfg.get('columns', 5)
        spacing_x = seating_cfg.get('spacing_x', 2.4)
        spacing_z = seating_cfg.get('spacing_z', 2.2)
        start_x = seating_cfg.get('start_x', -((cols - 1) * spacing_x) / 2.0)
        start_z = seating_cfg.get('start_z', 3.5)

        created_seats = []
        for r in range(1, rows + 1):
            for c in range(1, cols + 1):
                identifier = f"R{r}-S{c}"
                x = start_x + (c - 1) * spacing_x
                # Front of room is negative Z, so row 1 is closer to front (lower Z)
                z = (start_z - (rows - 1) * spacing_z) + (r - 1) * spacing_z
                seat, _ = cls.objects.get_or_create(
                    classroom=classroom,
                    seat_identifier=identifier,
                    defaults={
                        'row_number': r,
                        'column_number': c,
                        'position_x': round(x, 2),
                        'position_y': 0.0,
                        'position_z': round(z, 2),
                        'rotation': 0.0,
                        'is_active': True,
                    }
                )
                created_seats.append(seat)
        return created_seats

class SessionSeatReservation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ClassroomSession, on_delete=models.CASCADE, related_name='seat_reservations')
    seat = models.ForeignKey(ClassroomSeat, on_delete=models.CASCADE, related_name='reservations')
    participant = models.ForeignKey(SessionParticipant, on_delete=models.CASCADE, related_name='seat_reservation')
    reserved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            ('session', 'seat'),
            ('session', 'participant'),
        )

    def __str__(self):
        return f"{self.participant.user.username} reserved {self.seat.seat_identifier} in {self.session.title}"
