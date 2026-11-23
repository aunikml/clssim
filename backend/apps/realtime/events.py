import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)

def broadcast_session_event(session_id, event_type, payload, participant_id=None):
    """
    Broadcasts standard real-time event to the session channel group:
    session_<session_id>
    """
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        group_name = f"session_{session_id}"
        message = {
            "type": "classroom_event",
            "event": event_type,
            "session_id": str(session_id),
            "participant_id": str(participant_id) if participant_id else None,
            "payload": payload,
        }
        async_to_sync(channel_layer.group_send)(group_name, message)
    except Exception as e:
        logger.warning(f"Could not broadcast event {event_type} to session {session_id}: {e}")
