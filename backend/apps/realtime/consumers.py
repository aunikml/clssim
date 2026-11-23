import json
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from apps.sessions.models import ClassroomSession, SessionParticipant

logger = logging.getLogger(__name__)

class ClassroomSessionConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f"session_{self.session_id}"
        self.user = self.scope.get('user')

        # Check if user is authenticated (or allow guest in dev mode if requested)
        if not self.user or not self.user.is_authenticated:
            # We can still accept if configured, but as per requirements, authenticate WebSocket
            logger.info(f"Rejecting unauthenticated connection to session {self.session_id}")
            await self.close(code=4401)
            return

        session_valid = await self.validate_session_and_participant()
        if not session_valid:
            await self.close(code=4404)
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Notify others that participant connected
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'classroom_event',
                'event': 'participant.connected',
                'session_id': str(self.session_id),
                'participant_id': str(self.participant_id),
                'payload': {
                    'username': self.user.username,
                    'is_connected': True
                }
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

        if hasattr(self, 'participant_id'):
            await self.mark_participant_disconnected()
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'classroom_event',
                        'event': 'participant.disconnected',
                        'session_id': str(self.session_id),
                        'participant_id': str(self.participant_id),
                        'payload': {
                            'username': self.user.username,
                            'is_connected': False
                        }
                    }
                )

    async def receive_json(self, content):
        """
        Handle incoming messages from client (e.g. heartbeat ping, state query, chalkboard drawing, hand raising)
        """
        action = content.get('action')
        if action == 'ping':
            await self.send_json({'event': 'pong', 'timestamp': timezone.now().isoformat()})
        elif action == 'get_state':
            state = await self.get_session_state()
            await self.send_json({'event': 'session.state', 'payload': state})
        elif action in ('blackboard.draw', 'blackboard.clear', 'participant.hand_raise', 'speaking.start', 'speaking.stop'):
            # Broadcast to entire session room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'classroom_event',
                    'event': action,
                    'session_id': str(self.session_id),
                    'participant_id': str(getattr(self, 'participant_id', None)),
                    'payload': content.get('payload', {}),
                }
            )

    async def classroom_event(self, event):
        """
        Send event from channel layer down to the WebSocket client
        """
        await self.send_json({
            'event': event['event'],
            'session_id': event['session_id'],
            'participant_id': event.get('participant_id'),
            'payload': event['payload']
        })

    @database_sync_to_async
    def validate_session_and_participant(self):
        try:
            session = ClassroomSession.objects.get(id=self.session_id)
        except ClassroomSession.DoesNotExist:
            return False

        participant, _ = SessionParticipant.objects.get_or_create(
            session=session,
            user=self.user,
            defaults={'role': 'student', 'is_connected': True}
        )
        participant.is_connected = True
        participant.last_active_at = timezone.now()
        participant.save(update_fields=['is_connected', 'last_active_at'])
        self.participant_id = participant.id
        return True

    @database_sync_to_async
    def mark_participant_disconnected(self):
        try:
            participant = SessionParticipant.objects.get(id=self.participant_id)
            participant.is_connected = False
            participant.last_active_at = timezone.now()
            participant.save(update_fields=['is_connected', 'last_active_at'])
        except Exception:
            pass

    @database_sync_to_async
    def get_session_state(self):
        session = ClassroomSession.objects.get(id=self.session_id)
        return {
            'session_id': str(session.id),
            'title': session.title,
            'status': session.status,
            'active_teacher': getattr(session.participants.filter(role='teacher', is_connected=True).first(), 'user', None) and session.participants.filter(role='teacher', is_connected=True).first().user.username
        }
