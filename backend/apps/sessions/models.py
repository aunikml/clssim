import uuid
from django.db import models
from django.conf import settings
from apps.classrooms.models import Classroom

class ClassroomSession(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='sessions')
    facilitator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='facilitated_sessions'
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    scheduled_start = models.DateTimeField(null=True, blank=True)
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    max_participants = models.PositiveIntegerField(default=30)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} [{self.status}]"

class SessionParticipant(models.Model):
    ROLE_CHOICES = (
        ('facilitator', 'Facilitator'),
        ('teacher', 'Teacher Participant'),
        ('student', 'Student Participant'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ClassroomSession, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='session_participations')
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='student')
    is_connected = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    last_active_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('session', 'user')

    def __str__(self):
        return f"{self.user.username} as {self.role} in {self.session.title}"
