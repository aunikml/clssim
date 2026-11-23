import os
import time
import json
import jwt

def generate_livekit_token(room_name, identity, name=None, metadata=None, ttl_seconds=3600):
    api_key = os.getenv('LIVEKIT_API_KEY', 'devkey')
    api_secret = os.getenv('LIVEKIT_API_SECRET', 'secret_classsim_livekit_key_2026')

    now = int(time.time())
    payload = {
        'iss': api_key,
        'sub': str(identity),
        'name': name or str(identity),
        'nbf': now - 5,
        'exp': now + ttl_seconds,
        'video': {
            'room': str(room_name),
            'roomJoin': True,
            'canPublish': True,
            'canSubscribe': True,
            'canPublishData': True,
        },
    }

    if metadata:
        payload['metadata'] = json.dumps(metadata) if isinstance(metadata, (dict, list)) else str(metadata)

    token = jwt.encode(payload, api_secret, algorithm='HS256')
    return token
