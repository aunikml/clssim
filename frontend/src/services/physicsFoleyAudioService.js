// Procedural Web Audio Foley synthesizer for Rapier physics collisions and classroom acoustics
class PhysicsFoleyAudioService {
  constructor() {
    this.audioCtx = null;
    this.lastPencilSound = 0;
    this.lastChairScrape = 0;
    this.lastChalkSound = 0;
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

  // 1. Pencil rolling or dropping onto desk/floor
  playPencilDrop(force = 1.0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastPencilSound < 0.08) return;
    this.lastPencilSound = now;

    const clampedForce = Math.min(Math.max(force, 0.2), 3.0);
    const gainVal = Math.min(0.18 * (clampedForce / 1.5), 0.25);

    // Initial sharp graphite/wood tap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);

    // Micro-bounce click 45ms later
    setTimeout(() => {
      if (!this.audioCtx) return;
      const bNow = this.audioCtx.currentTime;
      const bOsc = this.audioCtx.createOscillator();
      const bGain = this.audioCtx.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(1900 + Math.random() * 300, bNow);
      bOsc.frequency.exponentialRampToValueAtTime(500, bNow + 0.015);
      bGain.gain.setValueAtTime(gainVal * 0.45, bNow);
      bGain.gain.exponentialRampToValueAtTime(0.001, bNow + 0.02);
      bOsc.connect(bGain);
      bGain.connect(this.audioCtx.destination);
      bOsc.start(bNow);
      bOsc.stop(bNow + 0.02);
    }, 45);
  }

  // 2. Chalk piece snapping or clacking on blackboard ledge / floor
  playChalkClack(force = 1.0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastChalkSound < 0.1) return;
    this.lastChalkSound = now;

    const gainVal = Math.min(0.22 * Math.min(force, 2.0), 0.3);

    // High brittle clack
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400 + Math.random() * 600, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // 3. Heavy textbook thud onto wooden desk
  playBookThud(force = 1.0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const gainVal = Math.min(0.3 * Math.min(force, 2.5), 0.4);

    // Deep low thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    // Secondary wooden desk hollow resonance
    const woodOsc = ctx.createOscillator();
    const woodGain = ctx.createGain();
    woodOsc.type = 'sine';
    woodOsc.frequency.setValueAtTime(280, now);
    woodOsc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
    woodGain.gain.setValueAtTime(gainVal * 0.5, now);
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    woodOsc.connect(woodGain);
    woodGain.connect(ctx.destination);
    woodOsc.start(now);
    woodOsc.stop(now + 0.09);
  }

  // 4. Chair scraping along parquet / linoleum when student shifts or stands
  playChairScrape(duration = 0.22) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastChairScrape < 0.25) return;
    this.lastChairScrape = now;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Resonant bandpass filter mimicking friction squeal
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(620 + Math.random() * 150, now);
    filter.Q.setValueAtTime(4.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  }

  // 5. Paper airplane aerodynamic glide / whisper
  playPaperGlide() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const dur = 0.8;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(600, now + dur);
    filter.Q.setValueAtTime(2.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.09, now + dur * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur);
  }

  // 6. Spilled pencil case cascading clatter
  playCanisterSpill() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Initial metal can thud
    this.playBookThud(1.4);

    // Cascading pencils scattering
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        this.playPencilDrop(1.2 - i * 0.1);
      }, 70 + i * 45 + Math.random() * 30);
    }
  }

  // 7. Metal Hydroflask Bottle Topple & Roll (Stainless Steel Clatter)
  playMetalBottleDrop(force = 1.0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const gainVal = Math.min(0.28 * Math.min(force, 2.0), 0.35);

    // Initial metallic body clang (3 harmonic inharmonic partials)
    const freqs = [1180, 2140, 3420];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 80, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.35);

      gain.gain.setValueAtTime(gainVal / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });

    // Secondary floor impact bounce clangs
    const bounces = [130, 260, 410, 580];
    bounces.forEach((delayMs, bIdx) => {
      setTimeout(() => {
        if (!this.audioCtx) return;
        const bNow = this.audioCtx.currentTime;
        const bOsc = this.audioCtx.createOscillator();
        const bGain = this.audioCtx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(1400 - bIdx * 160 + Math.random() * 80, bNow);
        bOsc.frequency.exponentialRampToValueAtTime(450, bNow + 0.12);

        const bVol = (gainVal * 0.45) / (bIdx + 1);
        bGain.gain.setValueAtTime(bVol, bNow);
        bGain.gain.exponentialRampToValueAtTime(0.001, bNow + 0.14);

        bOsc.connect(bGain);
        bGain.connect(this.audioCtx.destination);
        bOsc.start(bNow);
        bOsc.stop(bNow + 0.15);
      }, delayMs);
    });
  }

  // 8. Desk Phone Vibration (Haptic Wooden Resonance Buzz)
  playPhoneVibration() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Dual-burst haptic buzz: *bzz-bzz* ... *bzz-bzz*
    const playBurst = (startTime, duration = 0.22) => {
      const now = startTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Dual-tone motor vibration
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(138, now);
      osc.frequency.linearRampToValueAtTime(142, now + duration);

      // Wooden desk resonance bandpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(240, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
      gain.gain.setValueAtTime(0.20, now + duration - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    };

    const t0 = ctx.currentTime;
    playBurst(t0, 0.22);
    playBurst(t0 + 0.32, 0.24);
  }

  // 9. Soft Sleep Startle Breath / Cloth Rustle
  playSleepStartleGasp() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.25;

    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + dur);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur);
  }

  // 10. Teacher Firm Knuckle Tap on Wooden Desk (Refocus / Wake up student)
  playDeskTap() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const tapKnock = (delay, freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(55, now + delay + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now + delay);

      gain.gain.setValueAtTime(0.01, now + delay);
      gain.gain.linearRampToValueAtTime(0.35, now + delay + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    };

    tapKnock(0, 180);
    tapKnock(0.12, 195);
  }

  // 11. Encouraging Academic Praise Chime (+5 Participation Points)
  playPraiseChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

    notes.forEach((freq, idx) => {
      const delay = idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.01, now + delay);
      gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.65);
    });
  }
}

export const physicsFoleyAudioService = new PhysicsFoleyAudioService();
