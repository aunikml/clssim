// High-fidelity Speech Synthesis Service using Google TTS Engine (with Web Speech fallback)
// Delivers smooth, natural-sounding teacher lecture and student responses.

const FEMALE_NAMES_REGEX =
  /female|google us english|zira|jenny|aria|susan|hazel|heera|linda|catherine|eva|amy|victoria|samantha|karen|fiona|moira|tessa|veena|steffi|anna|helena|clara|alice|stephanie|michelle|libby|natasha|sonia|neerja|en-us-x-sfg#female/i;

const MALE_NAMES_REGEX =
  /male|david|guy|christopher|mark|george|ryan|james|richard|daniel|alex|fred|oliver|arthur|brian|william|en-us-x-sfg#male/i;

class ClassroomVoiceService {
  constructor() {
    this.voices = [];
    this.isInitialized = false;
    this.currentUtterance = null;
    this.currentAudio = null;
    this.activeSpeaker = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices() || [];
    this.isInitialized = this.voices.length > 0;
  }

  findBestVoice(gender = 'male', preferredNames = []) {
    this.initVoices();
    if (!this.voices || this.voices.length === 0) return null;

    if (gender === 'male') {
      // 1. Try explicit preferred names, strictly ensuring no female voices match
      for (const pref of preferredNames) {
        const match = this.voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            v.name.toLowerCase().includes(pref.toLowerCase()) &&
            !FEMALE_NAMES_REGEX.test(v.name)
        );
        if (match) return match;
      }

      // 2. Strict male keyword matching
      const maleMatch = this.voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          MALE_NAMES_REGEX.test(v.name) &&
          !FEMALE_NAMES_REGEX.test(v.name)
      );
      if (maleMatch) return maleMatch;

      // 3. Fallback to any English voice that is NOT female
      const nonFemale = this.voices.find(
        (v) => v.lang.startsWith('en') && !FEMALE_NAMES_REGEX.test(v.name)
      );
      if (nonFemale) return nonFemale;

      // 4. Any voice that is not female
      const anyNonFemale = this.voices.find((v) => !FEMALE_NAMES_REGEX.test(v.name));
      if (anyNonFemale) return anyNonFemale;

      return this.voices[0] || null;
    } else {
      // 1. Try explicit preferred names
      for (const pref of preferredNames) {
        const match = this.voices.find(
          (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes(pref.toLowerCase())
        );
        if (match) return match;
      }

      // 2. Female voice matching
      const femaleMatch = this.voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (FEMALE_NAMES_REGEX.test(v.name) || /female/i.test(v.name))
      );
      if (femaleMatch) return femaleMatch;

      return this.voices.find((v) => v.lang.startsWith('en')) || this.voices[0] || null;
    }
  }

  smoothPhonetics(text) {
    if (!text) return '';
    return text
      .replace(/\bCO2\b/g, 'carbon dioxide')
      .replace(/\bH2O\b/g, 'water')
      .replace(/\bRuBisCO\b/g, 'Rubisco')
      .replace(/\bRuBP\b/g, 'R-U-B-P')
      .replace(/\bATP\b/g, 'A-T-P')
      .replace(/\bNADPH\b/g, 'N-A-D-P-H')
      .replace(/\bSA node\b/gi, 'S-A node')
      .replace(/\bAV node\b/gi, 'A-V node')
      .replace(/\bbpm\b/gi, 'beats per minute')
      .replace(/\bmmHg\b/gi, 'millimeters of mercury')
      .replace(/\bRA\b/g, 'Right Atrium')
      .replace(/\bRV\b/g, 'Right Ventricle')
      .replace(/\bLA\b/g, 'Left Atrium')
      .replace(/\bLV\b/g, 'Left Ventricle')
      .replace(/\.\.\./g, ', ')
      .replace(/—/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Primary Method: Stream smooth Google TTS audio directly from backend proxy
  playGoogleTTS(text, role = 'teacher', { onStart, onEnd } = {}) {
    this.stop();

    const smoothed = this.smoothPhonetics(text);
    const encodedText = encodeURIComponent(smoothed);
    const audioUrl = `http://localhost:8000/api/v1/tts/synthesize/?text=${encodedText}&role=${role}`;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = audioUrl;
    this.currentAudio = audio;
    this.activeSpeaker = role === 'teacher' ? 'Teacher John' : role;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      this.activeSpeaker = null;
      this.currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.warn('[Google TTS Notice] Audio stream unavailable, using natural browser fallback:', e);
      this.currentAudio = null;
      if (role === 'teacher') {
        this.fallbackSpeakTeacher(smoothed, { onStart, onEnd });
      } else {
        this.fallbackSpeakStudent(role, smoothed, { onStart, onEnd });
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy or fetch error
        console.warn('[Audio Play] Fallback triggered:', err);
        if (role === 'teacher') {
          this.fallbackSpeakTeacher(smoothed, { onStart, onEnd });
        } else {
          this.fallbackSpeakStudent(role, smoothed, { onStart, onEnd });
        }
      });
    }
  }

  // 1. Teacher Speech: Dedicated Male Voice for Teacher John
  speakTeacher(text, { onStart, onEnd } = {}) {
    this.stop();
    const smoothed = this.smoothPhonetics(text);
    this.fallbackSpeakTeacher(smoothed, { onStart, onEnd });
  }

  // 2. Student Speech (Sophia, Ethan, etc.)
  speakStudent(speakerName, text, { onStart, onEnd } = {}) {
    this.playGoogleTTS(text, speakerName.toLowerCase(), { onStart, onEnd });
  }

  // Male Voice for Teacher John
  fallbackSpeakTeacher(smoothed, { onStart, onEnd } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.initVoices();

    // If voices are not yet loaded (asynchronous in Chromium browsers), retry when ready
    if (this.voices.length === 0) {
      const onVoicesReady = () => {
        window.speechSynthesis.onvoiceschanged = null;
        this.fallbackSpeakTeacher(smoothed, { onStart, onEnd });
      };
      window.speechSynthesis.onvoiceschanged = onVoicesReady;
      setTimeout(() => {
        if (this.voices.length === 0) {
          this.initVoices();
          if (this.voices.length > 0) {
            this.fallbackSpeakTeacher(smoothed, { onStart, onEnd });
          }
        }
      }, 150);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(smoothed);
    const teacherVoice = this.findBestVoice('male', [
      'Google UK English Male',
      'Microsoft Guy Online (Natural)',
      'Microsoft Christopher Online (Natural)',
      'Microsoft David Desktop',
      'Microsoft David',
      'Microsoft Mark Desktop',
      'Microsoft Mark',
      'Microsoft George Desktop',
      'Microsoft George',
      'Microsoft Ryan Online (Natural)',
      'Microsoft James',
      'Daniel',
      'Alex',
      'Fred',
      'Oliver',
      'Arthur',
    ]);
    if (teacherVoice) {
      utterance.voice = teacherVoice;
    }
    // Deep, authoritative pedagogical resonance
    utterance.pitch = 0.85;
    utterance.rate = 0.95;
    utterance.onstart = () => {
      this.activeSpeaker = 'Teacher John';
      if (onStart) onStart();
    };
    utterance.onend = () => {
      this.activeSpeaker = null;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.activeSpeaker = null;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };
    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  // Fallback 2: Web Speech API for Students
  fallbackSpeakStudent(speakerName, smoothed, { onStart, onEnd } = {}) {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(smoothed);
    const isFemale = speakerName === 'sophia' || speakerName === 'student_female';
    const voice = this.findBestVoice(isFemale ? 'female' : 'male', ['Microsoft Jenny', 'Google UK English Female', 'Zira']);
    if (voice) utterance.voice = voice;
    utterance.rate = isFemale ? 1.06 : 0.94;
    utterance.pitch = isFemale ? 1.16 : 0.92;
    utterance.onstart = () => { if (onStart) onStart(); };
    utterance.onend = () => { this.activeSpeaker = null; if (onEnd) onEnd(); };
    utterance.onerror = () => { this.activeSpeaker = null; if (onEnd) onEnd(); };
    window.speechSynthesis.speak(utterance);
  }

  // 3. Multi-Student Chaos Overlap for Question 3
  speakClassChaos(shouts = [], onAllEnd) {
    this.stop();

    let completed = 0;
    const total = shouts.length;

    shouts.forEach((shout, idx) => {
      setTimeout(() => {
        const smoothed = this.smoothPhonetics(shout.text);
        const encodedText = encodeURIComponent(smoothed);
        const audioUrl = `http://localhost:8000/api/v1/tts/synthesize/?text=${encodedText}&role=${shout.name.toLowerCase()}`;

        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = audioUrl;

        audio.onended = () => {
          completed++;
          if (completed >= total && onAllEnd) onAllEnd();
        };

        audio.onerror = () => {
          completed++;
          if (completed >= total && onAllEnd) onAllEnd();
        };

        audio.play().catch(() => {
          completed++;
          if (completed >= total && onAllEnd) onAllEnd();
        });
      }, idx * 160);
    });
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.activeSpeaker = null;
    this.currentUtterance = null;
  }
}

export const classroomVoiceService = new ClassroomVoiceService();
