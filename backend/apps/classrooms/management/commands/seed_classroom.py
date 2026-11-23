from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.classrooms.models import Classroom
from apps.seating.models import ClassroomSeat, SessionSeatReservation
from apps.sessions.models import ClassroomSession, SessionParticipant

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial traditional classroom, seats, users and an active session'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Classroom Simulator initial data...")

        # 1. Create or get Facilitator
        facilitator, _ = User.objects.get_or_create(
            username='facilitator',
            defaults={
                'email': 'facilitator@classsim.local',
                'first_name': 'Dr. Sarah',
                'last_name': 'Jenkins',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        facilitator.set_password('password123')
        facilitator.save()
        facilitator.participant_profile.display_name = 'Dr. Sarah Jenkins'
        facilitator.participant_profile.organisation = 'Faculty of Education'
        facilitator.participant_profile.avatar_identifier = 'teacher_default'
        facilitator.participant_profile.save()

        # 2. Create or get Teacher participant
        teacher, _ = User.objects.get_or_create(
            username='teacher_john',
            defaults={
                'email': 'teacher@classsim.local',
                'first_name': 'John',
                'last_name': 'Sterling',
            }
        )
        teacher.set_password('password123')
        teacher.save()
        teacher.participant_profile.display_name = 'Teacher John'
        teacher.participant_profile.avatar_identifier = 'teacher_avatar'
        teacher.participant_profile.save()

        # 3. Create or get Student participant
        student1, _ = User.objects.get_or_create(
            username='student_alice',
            defaults={
                'email': 'alice@classsim.local',
                'first_name': 'Alice',
                'last_name': 'Chen',
            }
        )
        student1.set_password('password123')
        student1.save()
        student1.participant_profile.display_name = 'Alice Chen'
        student1.participant_profile.avatar_identifier = 'student_blue'
        student1.participant_profile.save()

        # 4. Create or get Traditional Classroom
        classroom, created = Classroom.objects.get_or_create(
            name='Traditional Classroom A101',
            defaults={
                'description': 'A warm, stylized traditional classroom equipped with 20 student desks, blackboard, teacher desk and windows.',
                'environment_type': 'traditional',
                'width': 20.0,
                'length': 16.0,
                'wall_height': 5.0,
                'is_active': True,
            }
        )
        # Ensure 20 seats are generated
        seats = ClassroomSeat.generate_seats_for_classroom(classroom)
        self.stdout.write(f"Classroom '{classroom.name}' has {len(seats)} seats.")

        # 5. Create or get Classroom Session
        session, _ = ClassroomSession.objects.get_or_create(
            title='Interactive Pedagogy Practicum',
            classroom=classroom,
            defaults={
                'facilitator': facilitator,
                'status': 'active',
                'max_participants': 25,
                'settings': {
                    'allow_student_roaming': False,
                    'require_hand_raising': True,
                }
            }
        )

        # 6. Add participants to session
        p_facil, _ = SessionParticipant.objects.get_or_create(
            session=session,
            user=facilitator,
            defaults={'role': 'facilitator', 'is_connected': True}
        )

        p_teacher, _ = SessionParticipant.objects.get_or_create(
            session=session,
            user=teacher,
            defaults={'role': 'teacher', 'is_connected': True}
        )

        p_alice, _ = SessionParticipant.objects.get_or_create(
            session=session,
            user=student1,
            defaults={'role': 'student', 'is_connected': True}
        )

        # Reserve seat R1-S1 for Alice Chen
        seat_r1_s1 = ClassroomSeat.objects.filter(classroom=classroom, seat_identifier='R1-S1').first()
        if seat_r1_s1:
            SessionSeatReservation.objects.get_or_create(
                session=session,
                seat=seat_r1_s1,
                defaults={'participant': p_alice}
            )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded! Classroom ID: {classroom.id}, Session ID: {session.id}"
        ))
