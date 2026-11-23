class ClassroomAtmosphereAudioService {
  constructor() {
    this.audioCtx = null;
    this.clockInterval = null;
    this.isClockActive = false;

    // Ambient Continuous Student Chatter Engine
    this.isChatterActive = false;
    this.chatterGainNode = null;
    this.chatterSourceNodes = [];
    this.targetChatterVol = 0.04;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // 1. Analog Wall Clock (Disabled)
  startClock() {
    // Disabled
  }

  stopClock() {
    this.isClockActive = false;
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  playClockTick(isTick) {
    // Disabled
  }

  // 2. Authentic Chalk-on-Blackboard Scratching Audio
  playChalkScratch(durationMs = 800) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    // Filtered granular noise burst simulating chalk friction on slate
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Modulate noise with micro-stutters like chalk skipping on stone
      const skip = Math.sin(i * 0.04) > 0.3 ? 1.0 : 0.4;
      data[i] = (Math.random() * 2 - 1) * skip;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2600, now);
    bandpass.Q.setValueAtTime(2.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.linearRampToValueAtTime(0.09, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // 3. Felt Eraser Wiping Chalk Dust Sound
  playEraserWipe() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 0.55;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(950, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // 4. Notebook Paper Page Turning / Rustle
  playPaperRustle() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 0.38;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.7;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // 5. Continuous Ambient Classroom Chatter & Commotion Engine
  startAmbientChatter(initialVolume = 0.035) {
    if (this.isChatterActive) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      this.isChatterActive = true;
      this.targetChatterVol = initialVolume;

      // Master Chatter Volume Gain Node
      const masterGain = ctx.createGain();
      const now = ctx.currentTime;
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(initialVolume, now + 1.5);
      masterGain.connect(ctx.destination);
      this.chatterGainNode = masterGain;

      // 4-Second Seamless Loop Buffer with Multi-Voice Formant Chatter
      const bufferLength = ctx.sampleRate * 4.0;
      const buffer = ctx.createBuffer(2, bufferLength, ctx.sampleRate);
      const chL = buffer.getChannelData(0);
      const chR = buffer.getChannelData(1);

      for (let i = 0; i < bufferLength; i++) {
        const t = i / ctx.sampleRate;
        // Superposition of gentle formant frequencies simulating multiple murmuring voices
        const voice1 = Math.sin(t * 2 * Math.PI * 180) * Math.sin(t * 14);
        const voice2 = Math.cos(t * 2 * Math.PI * 260) * Math.sin(t * 11);
        const voice3 = Math.sin(t * 2 * Math.PI * 340) * Math.cos(t * 8.5);
        const noise = (Math.random() * 2 - 1) * 0.4;
        const breath = Math.sin(t * 1.8) * 0.25;

        const composite = (voice1 * 0.3 + voice2 * 0.25 + voice3 * 0.2 + noise) * (0.6 + breath);
        chL[i] = composite * (0.8 + Math.sin(t * 0.8) * 0.2);
        chR[i] = composite * (0.8 + Math.cos(t * 0.8) * 0.2);
      }

      const loopSource = ctx.createBufferSource();
      loopSource.buffer = buffer;
      loopSource.loop = true;

      // Human Vocal Tract Formant Bandpass Filters
      const filter1 = ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(550, now);
      filter1.Q.setValueAtTime(2.2, now);

      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(1400, now);

      loopSource.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(masterGain);

      loopSource.start(now);
      this.chatterSourceNodes = [loopSource];
    } catch (err) {
      console.warn('Ambient chatter initialization deferred until user interaction:', err);
    }
  }

  // Smoothly ramp chatter volume up or down (e.g. ducking when teacher speaks)
  fadeChatter(targetVol, durationSec = 1.0) {
    if (!this.chatterGainNode || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    this.targetChatterVol = targetVol;
    this.chatterGainNode.gain.cancelScheduledValues(now);
    this.chatterGainNode.gain.setValueAtTime(this.chatterGainNode.gain.value, now);
    this.chatterGainNode.gain.linearRampToValueAtTime(Math.max(0.0001, targetVol), now + durationSec);
  }

  // Auto-ducking update driven by classroom state
  updateChatterDucking({ isLectureRunning, isTeacherSpeaking, isPaused }) {
    if (!this.isChatterActive) {
      this.startAmbientChatter(0.035);
      return;
    }
    if (isTeacherSpeaking || (isLectureRunning && !isPaused)) {
      // Quiet down room when teacher is active
      this.fadeChatter(0.0001, 1.2);
    } else {
      // Background murmur resumes during pre-class countdown, pause, or idle
      this.fadeChatter(0.035, 1.5);
    }
  }

  stopAmbientChatter() {
    if (!this.isChatterActive) return;
    this.isChatterActive = false;
    if (this.chatterGainNode && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.chatterGainNode.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      setTimeout(() => {
        this.chatterSourceNodes.forEach((s) => {
          try { s.stop(); s.disconnect(); } catch (e) {}
        });
        this.chatterSourceNodes = [];
        this.chatterGainNode = null;
      }, 600);
    }
  }

  // 6. Classroom Era Metamorphosis Sound Effects
  playEraTransitionSound(toEra) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (toEra === 'high_resource' || toEra === 'edtech') {
      // Ascending Digital Boot Arpeggio (C4 -> E4 -> G4 -> C5 -> E5 -> G5)
      const freqs = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.38);
      });
    } else if (toEra === 'low_resource') {
      // Projector Lamp & Power-on Beep + Fan Spin-up (BEEP-BOOP 880Hz -> 1320Hz)
      const beeps = [880, 1320];
      beeps.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.035, now + idx * 0.12 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.09);

        // Low-pass filter to soften the square wave beep
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.1);
      });

      // Subtle projector fan whirl
      setTimeout(() => {
        const fanDuration = 0.8;
        const bufferSize = ctx.sampleRate * fanDuration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const fanFilter = ctx.createBiquadFilter();
        fanFilter.type = 'bandpass';
        fanFilter.frequency.setValueAtTime(500, ctx.currentTime);
        fanFilter.Q.setValueAtTime(2.0, ctx.currentTime);

        const fanGain = ctx.createGain();
        fanGain.gain.setValueAtTime(0.001, ctx.currentTime);
        fanGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.2);
        fanGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + fanDuration);

        noise.connect(fanFilter);
        fanFilter.connect(fanGain);
        fanGain.connect(ctx.destination);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + fanDuration);
      }, 240);
    } else {
      // Traditional Classroom Mechanical Latch + Chalk Tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);

      // Chalk scratch burst
      setTimeout(() => {
        this.playChalkScratch(400);
      }, 100);
    }
  }

  // Legacy single burst murmur
  playClassroomMurmur(durationMs = 2800) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const chatter = Math.sin(i * 0.035) * Math.cos(i * 0.08) * (Math.random() * 2 - 1);
      data[i] = chatter * 0.55;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(650, now);
    filter1.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter1);
    filter1.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }
}

export const classroomAtmosphereAudioService = new ClassroomAtmosphereAudioService();
