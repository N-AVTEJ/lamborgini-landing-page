// Web Audio API Synthesizer for Land Rover Defender Twin-Turbo V8 Engine
class DefenderV8EngineSynthesizer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isRevving = false;
    this.currentRPM = 0;
    this.onRPMUpdate = null;
    this.animFrameId = null;
    this.revAnimFrameId = null;
    this.stopTimeoutId = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate distortion curve for deep V8 exhaust growl
  makeDistortionCurve(amount = 25) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  startIdle(onRPM) {
    this.init();
    if (this.stopTimeoutId) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.onRPMUpdate = onRPM;

    const t = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, t);
    this.masterGain.gain.linearRampToValueAtTime(0.38, t + 0.5);
    this.masterGain.connect(this.ctx.destination);

    // Distortion shaper for deep British V8 growl
    this.shaper = this.ctx.createWaveShaper();
    this.shaper.curve = this.makeDistortionCurve(20);
    this.shaper.oversample = '4x';
    this.shaper.connect(this.masterGain);

    // Exhaust resonator lowpass filter
    this.exhaustFilter = this.ctx.createBiquadFilter();
    this.exhaustFilter.type = 'lowpass';
    this.exhaustFilter.frequency.setValueAtTime(380, t);
    this.exhaustFilter.Q.setValueAtTime(3.0, t);
    this.exhaustFilter.connect(this.shaper);

    // Primary V8 Firing Osc (Crossplane Sawtooth)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(55, t); // ~650 RPM crossplane idle pulse

    // Secondary Sub-Harmonic Rumble Osc (Deep engine block resonance)
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(27.5, t); // Sub-bass crank rumble

    // Third Osc for turbo induction whistle / supercharger whine
    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = 'sawtooth';
    this.osc3.frequency.setValueAtTime(110, t); // 2nd order harmonic

    // Connect oscillators to filter
    this.osc1.connect(this.exhaustFilter);
    this.osc2.connect(this.exhaustFilter);
    this.osc3.connect(this.exhaustFilter);

    this.osc1.start(t);
    this.osc2.start(t);
    this.osc3.start(t);

    this.currentRPM = 750;
    this.updateRPMLoop();
  }

  revEngine() {
    // Guard against re-triggering while a rev sweep is already in progress
    if (!this.isPlaying || !this.ctx || this.isRevving) return;
    this.isRevving = true;
    const t = this.ctx.currentTime;

    // Throttle sweep up to 7,200 RPM redline
    // Idle 55Hz -> Redline ~600Hz
    this.osc1.frequency.cancelScheduledValues(t);
    this.osc2.frequency.cancelScheduledValues(t);
    this.osc3.frequency.cancelScheduledValues(t);
    this.exhaustFilter.frequency.cancelScheduledValues(t);
    this.masterGain.gain.cancelScheduledValues(t);

    // Acceleration Ramp (0.75s)
    this.osc1.frequency.linearRampToValueAtTime(580, t + 0.75);
    this.osc2.frequency.linearRampToValueAtTime(290, t + 0.75);
    this.osc3.frequency.linearRampToValueAtTime(1160, t + 0.75);
    this.exhaustFilter.frequency.exponentialRampToValueAtTime(2600, t + 0.75);
    this.masterGain.gain.linearRampToValueAtTime(0.55, t + 0.75);

    // Hold at limiter briefly with V8 flutter
    this.osc1.frequency.setValueAtTime(600, t + 0.8);
    this.osc1.frequency.setValueAtTime(560, t + 0.9);

    // Deceleration Overrun return to idle (1.2s)
    this.osc1.frequency.exponentialRampToValueAtTime(55, t + 2.1);
    this.osc2.frequency.exponentialRampToValueAtTime(27.5, t + 2.1);
    this.osc3.frequency.exponentialRampToValueAtTime(110, t + 2.1);
    this.exhaustFilter.frequency.exponentialRampToValueAtTime(380, t + 2.1);
    this.masterGain.gain.linearRampToValueAtTime(0.38, t + 2.1);

    // Cancel any previous rev animation frame
    if (this.revAnimFrameId) cancelAnimationFrame(this.revAnimFrameId);

    // Animate RPM value
    const startT = performance.now();
    const animateRev = (now) => {
      const elapsed = (now - startT) / 1000;
      if (elapsed < 0.75) {
        // Accelerating
        this.currentRPM = Math.round(750 + (elapsed / 0.75) * 6450);
      } else if (elapsed < 0.95) {
        // Limiter bounce
        this.currentRPM = Math.round(7050 + Math.random() * 150);
      } else if (elapsed < 2.1) {
        // Falling back to idle
        const decay = (elapsed - 0.95) / 1.15;
        this.currentRPM = Math.round(7200 - decay * 6450);
      } else {
        this.currentRPM = 750;
        this.isRevving = false;
        if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);
        return;
      }
      if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);
      if (this.isRevving) {
        this.revAnimFrameId = requestAnimationFrame(animateRev);
      }
    };
    this.revAnimFrameId = requestAnimationFrame(animateRev);
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    this.isPlaying = false;
    this.isRevving = false;
    if (this.stopTimeoutId) clearTimeout(this.stopTimeoutId);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.revAnimFrameId) cancelAnimationFrame(this.revAnimFrameId);

    const t = this.ctx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(0, t + 0.35);
    } catch {
      // fallback
    }

    this.stopTimeoutId = setTimeout(() => {
      try {
        if (this.osc1) { this.osc1.stop(); this.osc1.disconnect(); }
        if (this.osc2) { this.osc2.stop(); this.osc2.disconnect(); }
        if (this.osc3) { this.osc3.stop(); this.osc3.disconnect(); }
      } catch {
        // ignore if already stopped
      }
      this.currentRPM = 0;
      if (this.onRPMUpdate) this.onRPMUpdate(0);
      this.stopTimeoutId = null;
    }, 400);
  }

  updateRPMLoop() {
    const loop = () => {
      if (!this.isPlaying) return;
      if (!this.isRevving) {
        // Subtle V8 idle flutter between 720 and 780 RPM
        this.currentRPM = Math.round(745 + (Math.sin(Date.now() / 250) * 20));
        if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }
}

export const defenderV8Engine = new DefenderV8EngineSynthesizer();
// Backwards compatibility alias
export const v12Engine = defenderV8Engine;
