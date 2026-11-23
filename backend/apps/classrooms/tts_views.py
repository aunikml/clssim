import os
import re
import hashlib
from io import BytesIO
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.conf import settings
from gtts import gTTS

# Text Normalizer for Natural Teacher & Student Biology & Cardiology Lecture Speech
PHONETIC_REPLACEMENTS = [
    (r'\bCO2\b', 'carbon dioxide'),
    (r'\bH2O\b', 'water'),
    (r'\bRuBisCO\b', 'Rubisco'),
    (r'\bRuBP\b', 'R-U-B-P'),
    (r'\bATP\b', 'A-T-P'),
    (r'\bNADPH\b', 'N-A-D-P-H'),
    (r'\bSA node\b', 'S-A node'),
    (r'\bAV node\b', 'A-V node'),
    (r'\bbpm\b', 'beats per minute'),
    (r'\bmmHg\b', 'millimeters of mercury'),
    (r'\bRA\b', 'Right Atrium'),
    (r'\bRV\b', 'Right Ventricle'),
    (r'\bLA\b', 'Left Atrium'),
    (r'\bLV\b', 'Left Ventricle'),
    (r'—', ', '),
    (r'\.\.\.', ', '),
]

def normalize_text_for_speech(text: str) -> str:
    cleaned = text
    for pattern, replacement in PHONETIC_REPLACEMENTS:
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)
    # Collapse excess whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

class GoogleTTSSynthesizeView(View):
    """
    Synthesizes natural teacher or student speech using Google TTS engine.
    Caches audio to disk so identical phrases return in 0ms.
    """
    def get(self, request, *args, **kwargs):
        text = request.GET.get('text', '').strip()
        role = request.GET.get('role', 'teacher').lower() # 'teacher', 'sophia', 'ethan', 'student'
        
        if not text:
            return JsonResponse({'error': 'Missing text parameter'}, status=400)

        # Truncate to reasonable lecture segment length
        if len(text) > 800:
            text = text[:800]

        normalized = normalize_text_for_speech(text)

        # Accent / regional tuning for diverse classroom persona voices
        if role in ['teacher', 'teacher_john']:
            # Refined British English accent for dignified teacher persona
            tld = 'co.uk'
            slow = False
        elif role in ['sophia', 'student_female']:
            # Standard US English accent for clear student responses
            tld = 'com'
            slow = False
        elif role in ['ethan', 'student_male']:
            # Canadian/Australian variant for distinct student persona
            tld = 'ca'
            slow = False
        else:
            tld = 'com'
            slow = False

        # Ensure cache directory exists
        cache_dir = os.path.join(settings.BASE_DIR, 'media', 'tts_cache')
        os.makedirs(cache_dir, exist_ok=True)

        cache_hash = hashlib.sha256(f"{role}:{tld}:{normalized}".encode('utf-8')).hexdigest()
        cache_file_path = os.path.join(cache_dir, f"{cache_hash}.mp3")

        # 1. Return cached audio immediately if available
        if os.path.exists(cache_file_path):
            with open(cache_file_path, 'rb') as f:
                audio_bytes = f.read()
            response = HttpResponse(audio_bytes, content_type='audio/mpeg')
            response['Cache-Control'] = 'public, max-age=86400'
            response['X-TTS-Source'] = 'cache'
            return response

        # 2. Synthesize with Google TTS
        try:
            tts = gTTS(text=normalized, lang='en', tld=tld, slow=slow)
            buffer = BytesIO()
            tts.write_to_fp(buffer)
            audio_bytes = buffer.getvalue()

            # Save to cache
            try:
                with open(cache_file_path, 'wb') as f:
                    f.write(audio_bytes)
            except Exception as e:
                print(f"[TTS Cache Warning] Could not save cache: {e}")

            response = HttpResponse(audio_bytes, content_type='audio/mpeg')
            response['Cache-Control'] = 'public, max-age=86400'
            response['X-TTS-Source'] = 'google-engine'
            return response
        except Exception as err:
            return JsonResponse({'error': f'Google TTS generation error: {str(err)}'}, status=500)
