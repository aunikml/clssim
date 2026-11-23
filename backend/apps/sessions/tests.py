from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.classrooms.models import Classroom
from apps.sessions.models import ClassroomSession, SessionParticipant

User = get_user_model()

class SessionLifecycleTests(TestCase):
    def setUp(self):
        self.facilitator = User.objects.create_user(username='facil', email='facil@test.local', password='password123')
        self.participant1 = User.objects.create_user(username='part1', email='part1@test.local', password='password123')
        self.participant2 = User.objects.create_user(username='part2', email='part2@test.local', password='password123')

        self.classroom = Classroom.objects.create(name='Physics Lab')

        self.client_f = APIClient()
        self.client_f.force_authenticate(user=self.facilitator)

        self.client_p = APIClient()
        self.client_p.force_authenticate(user=self.participant1)

    def test_session_lifecycle_and_roles(self):
        # 1. Create Session
        res = self.client_f.post('/api/v1/sessions/', {
            'title': 'Applied Physics 101',
            'classroom': str(self.classroom.id)
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        session_id = res.data['id']

        # 2. Participant joins
        join_res = self.client_p.post(f'/api/v1/sessions/{session_id}/join/', {'role': 'student'}, format='json')
        self.assertEqual(join_res.status_code, status.HTTP_200_OK)
        self.assertEqual(join_res.data['role'], 'student')

        # 3. Facilitator assigns participant as teacher
        role_res = self.client_f.post(f'/api/v1/sessions/{session_id}/assign-role/', {
            'user_id': str(self.participant1.id),
            'role': 'teacher'
        }, format='json')
        self.assertEqual(role_res.status_code, status.HTTP_200_OK)
        self.assertEqual(role_res.data['role'], 'teacher')

        # 4. Start session
        start_res = self.client_f.post(f'/api/v1/sessions/{session_id}/start/', format='json')
        self.assertEqual(start_res.status_code, status.HTTP_200_OK)
        self.assertEqual(start_res.data['status'], 'active')

        # 5. Pause session
        pause_res = self.client_f.post(f'/api/v1/sessions/{session_id}/pause/', format='json')
        self.assertEqual(pause_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pause_res.data['status'], 'paused')

        # 6. Complete session
        complete_res = self.client_f.post(f'/api/v1/sessions/{session_id}/complete/', format='json')
        self.assertEqual(complete_res.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_res.data['status'], 'completed')

    def test_livekit_token_generation(self):
        res = self.client_f.post('/api/v1/sessions/', {
            'title': 'LiveKit Audio Session',
            'classroom': str(self.classroom.id)
        }, format='json')
        session_id = res.data['id']

        # Get LiveKit token
        token_res = self.client_f.post(f'/api/v1/sessions/{session_id}/livekit-token/', format='json')
        self.assertEqual(token_res.status_code, status.HTTP_200_OK)
        self.assertIn('token', token_res.data)
        self.assertIn('room_name', token_res.data)
        self.assertEqual(token_res.data['participant_identity'], 'facil')
