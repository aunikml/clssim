from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.classrooms.models import Classroom
from apps.seating.models import ClassroomSeat

User = get_user_model()

class ClassroomTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='testuser@classsim.local', password='password123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_classroom_creation_generates_20_seats(self):
        res = self.client.post('/api/v1/classrooms/', {
            'name': 'Test Traditional Classroom',
            'environment_type': 'traditional',
            'width': 20.0,
            'length': 16.0,
            'wall_height': 5.0
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        classroom_id = res.data['id']
        classroom = Classroom.objects.get(id=classroom_id)

        # Check configuration
        self.assertIn('dimensions', classroom.configuration)
        self.assertIn('seating', classroom.configuration)
        self.assertEqual(classroom.configuration['seating']['rows'], 4)
        self.assertEqual(classroom.configuration['seating']['columns'], 5)

        # Verify 20 seats were generated
        seats = ClassroomSeat.objects.filter(classroom=classroom)
        self.assertEqual(seats.count(), 20)
        self.assertTrue(seats.filter(seat_identifier='R1-S1').exists())
        self.assertTrue(seats.filter(seat_identifier='R4-S5').exists())
