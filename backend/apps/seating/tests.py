from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.classrooms.models import Classroom
from apps.sessions.models import ClassroomSession, SessionParticipant
from apps.seating.models import ClassroomSeat, SessionSeatReservation

User = get_user_model()

class SeatingReservationTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='student1', email='student1@classsim.local', password='password123')
        self.user2 = User.objects.create_user(username='student2', email='student2@classsim.local', password='password123')
        self.facilitator = User.objects.create_user(username='facilitator', email='facil@classsim.local', password='password123')

        self.classroom = Classroom.objects.create(name='Room 101')
        ClassroomSeat.generate_seats_for_classroom(self.classroom)

        self.session = ClassroomSession.objects.create(
            title='Demo Session',
            classroom=self.classroom,
            facilitator=self.facilitator,
            status='active'
        )

        self.p1 = SessionParticipant.objects.create(session=self.session, user=self.user1, role='student')
        self.p2 = SessionParticipant.objects.create(session=self.session, user=self.user2, role='student')

        self.client1 = APIClient()
        self.client1.force_authenticate(user=self.user1)

        self.client2 = APIClient()
        self.client2.force_authenticate(user=self.user2)

    def test_successful_seat_reservation(self):
        reserve_url = f'/api/v1/sessions/{self.session.id}/seats/reserve/'
        res = self.client1.post(reserve_url, {'seat_identifier': 'R2-S3'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['seat_id'], 'R2-S3')
        self.assertEqual(res.data['status'], 'occupied')

        # Check in database
        self.assertTrue(SessionSeatReservation.objects.filter(session=self.session, seat__seat_identifier='R2-S3').exists())

    def test_duplicate_seat_reservation_conflict(self):
        # User 1 reserves R2-S3
        reserve_url = f'/api/v1/sessions/{self.session.id}/seats/reserve/'
        self.client1.post(reserve_url, {'seat_identifier': 'R2-S3'}, format='json')

        # User 2 tries to reserve same seat R2-S3
        res = self.client2.post(reserve_url, {'seat_identifier': 'R2-S3'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('already occupied', res.data['error'])

    def test_participant_seat_switch(self):
        # User 1 reserves R1-S1
        reserve_url = f'/api/v1/sessions/{self.session.id}/seats/reserve/'
        self.client1.post(reserve_url, {'seat_identifier': 'R1-S1'}, format='json')

        # User 1 reserves R1-S2: previous seat R1-S1 should be released
        res = self.client1.post(reserve_url, {'seat_identifier': 'R1-S2'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['previous_seat_released'], 'R1-S1')

        # Verify User 1 only has 1 seat reserved
        self.assertEqual(SessionSeatReservation.objects.filter(session=self.session, participant=self.p1).count(), 1)
        self.assertEqual(SessionSeatReservation.objects.get(session=self.session, participant=self.p1).seat.seat_identifier, 'R1-S2')

    def test_release_seat(self):
        reserve_url = f'/api/v1/sessions/{self.session.id}/seats/reserve/'
        release_url = f'/api/v1/sessions/{self.session.id}/seats/release/'

        self.client1.post(reserve_url, {'seat_identifier': 'R3-S4'}, format='json')
        self.assertTrue(SessionSeatReservation.objects.filter(session=self.session, seat__seat_identifier='R3-S4').exists())

        res = self.client1.post(release_url, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(SessionSeatReservation.objects.filter(session=self.session, seat__seat_identifier='R3-S4').exists())
