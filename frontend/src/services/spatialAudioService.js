class SpatialAudioService {
  constructor() {
    this.audioCtx = null;
    this.teacherPanner = null;
    this.testOscillator = null;
    this.testGain = null;
    this.isTestVoiceActive = false;
    this.listeners = new Set();

    // Default teacher position at front podium
    this.teacherPosition = [0, 1.7, -4.5];
    this.lastDistance = 0;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      this.audioCtx = new AudioContext();

      // Configure teacher 3D panner
      this.teacherPanner = this.audioCtx.createPanner();
      this.teacherPanner.panningModel = 'HRTF';
      this.teacherPanner.distanceModel = 'inverse';
      this.teacherPanner.refDistance = 2.0;
      this.teacherPanner.maxDistance = 22.0;
      this.teacherPanner.rolloffFactor = 1.25;
      this.teacherPanner.coneInnerAngle = 180;
      this.teacherPanner.coneOuterAngle = 360;
      this.teacherPanner.coneOuterGain = 0.4;

      this.teacherPanner.positionX.setValueAtTime(this.teacherPosition[0], this.audioCtx.currentTime);
      this.teacherPanner.positionY.setValueAtTime(this.teacherPosition[1], this.audioCtx.currentTime);
      this.teacherPanner.positionZ.setValueAtTime(this.teacherPosition[2], this.audioCtx.currentTime);

      this.teacherPanner.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  updateListener(posX, posY, posZ, forwardX = 0, forwardY = 0, forwardZ = -1) {
    if (!this.audioCtx) return;
    const t = this.audioCtx.currentTime;
    const listener = this.audioCtx.listener;

    if (listener.positionX) {
      listener.positionX.setValueAtTime(posX, t);
      listener.positionY.setValueAtTime(posY, t);
      listener.positionZ.setValueAtTime(posZ, t);
      listener.forwardX.setValueAtTime(forwardX, t);
      listener.forwardY.setValueAtTime(forwardY, t);
      listener.forwardZ.setValueAtTime(forwardZ, t);
      listener.upX.setValueAtTime(0, t);
      listener.upY.setValueAtTime(1, t);
      listener.upZ.setValueAtTime(0, t);
    } else if (listener.setPosition) {
      listener.setPosition(posX, posY, posZ);
      listener.setOrientation(forwardX, forwardY, forwardZ, 0, 1, 0);
    }

    // Compute distance to teacher podium
    const dx = posX - this.teacherPosition[0];
    const dy = posY - this.teacherPosition[1];
    const dz = posZ - this.teacherPosition[2];
    this.lastDistance = Math.hypot(dx, dy, dz);
  }

  getTeacherDistance() {
    return this.lastDistance;
  }

  toggleAcousticTestVoice() {
    if (this.isTestVoiceActive) {
      this.stopAcousticTestVoice();
      return false;
    } else {
      this.startAcousticTestVoice();
      return true;
    }
  }

  startAcousticTestVoice() {
    this.ensureContext();
    if (!this.audioCtx || this.isTestVoiceActive) return;

    // Harmonic voice-like modulated sound source
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220, this.audioCtx.currentTime); // A3 fundamental

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, this.audioCtx.currentTime); // Harmonic

    gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);

    // LFO speech envelope
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(1.8, this.audioCtx.currentTime);
    lfoGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    lfo.connect(lfoGain.gain);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.teacherPanner);

    osc1.start();
    osc2.start();

    this.testOscillator = { osc1, osc2, gain };
    this.isTestVoiceActive = true;
  }

  stopAcousticTestVoice() {
    if (!this.isTestVoiceActive || !this.testOscillator) return;
    try {
      this.testOscillator.osc1.stop();
      this.testOscillator.osc2.stop();
      this.testOscillator.gain.disconnect();
    } catch {
      // Ignored
    }
    this.testOscillator = null;
    this.isTestVoiceActive = false;
  }
}

export const spatialAudioService = new SpatialAudioService();
