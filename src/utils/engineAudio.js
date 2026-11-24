// Web Audio API Synthesizer for Lamborghini Naturally Aspirated V12 Engine
class V12EngineSynthesizer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isRevving = false;
    this.currentRPM = 0;
    this.onRPMUpdate = null;
    this.animFrameId = null;
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

  // Generate distortion curve for exhaust growl
  makeDistortionCurve(amount = 20) {
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
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.onRPMUpdate = onRPM;

    const t = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, t);
    this.masterGain.gain.linearRampToValueAtTime(0.35, t + 0.6);
    this.masterGain.connect(this.ctx.destination);

    // Distortion shaper for Italian exhaust edge
    this.shaper = this.ctx.createWaveShaper();
    this.shaper.curve = this.makeDistortionCurve(15);
    this.shaper.oversample = '4x';
    this.shaper.connect(this.masterGain);

    // Exhaust resonator lowpass filter
    this.exhaustFilter = this.ctx.createBiquadFilter();
    this.exhaustFilter.type = 'lowpass';
    this.exhaustFilter.frequency.setValueAtTime(450, t);
    this.exhaustFilter.Q.setValueAtTime(2.5, t);
    this.exhaustFilter.connect(this.shaper);

    // Primary V12 Firing Osc (Sawtooth)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(85, t); // ~850 RPM idle

    // Secondary Harmonic Osc (Square for cylinder pulse punch)
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(42.5, t); // Sub-harmonic crank rumble

    // Third high-frequency induction Osc
    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = 'sawtooth';
    this.osc3.frequency.setValueAtTime(170, t); // 2nd order harmonic

    // Connect oscillators to filter
    this.osc1.connect(this.exhaustFilter);
    this.osc2.connect(this.exhaustFilter);
    this.osc3.connect(this.exhaustFilter);

    this.osc1.start(t);
    this.osc2.start(t);
    this.osc3.start(t);

    this.currentRPM = 950;
    this.updateRPMLoop();
  }

  revEngine() {
    if (!this.isPlaying || !this.ctx) return;
    this.isRevving = true;
    const t = this.ctx.currentTime;

    // Aggressive throttle sweep up to 9,500 RPM
    // Idle 85Hz -> Redline ~950Hz
    this.osc1.frequency.cancelScheduledValues(t);
    this.osc2.frequency.cancelScheduledValues(t);
    this.osc3.frequency.cancelScheduledValues(t);
    this.exhaustFilter.frequency.cancelScheduledValues(t);
    this.masterGain.gain.cancelScheduledValues(t);

    // Acceleration Ramp (0.7s)
    this.osc1.frequency.linearRampToValueAtTime(920, t + 0.8);
    this.osc2.frequency.linearRampToValueAtTime(460, t + 0.8);
    this.osc3.frequency.linearRampToValueAtTime(1840, t + 0.8);
    this.exhaustFilter.frequency.exponentialRampToValueAtTime(3200, t + 0.8);
    this.masterGain.gain.linearRampToValueAtTime(0.55, t + 0.8);

    // Hold at limiter briefly (0.2s) with slight flutter
    this.osc1.frequency.setValueAtTime(940, t + 0.85);
    this.osc1.frequency.setValueAtTime(900, t + 0.95);

    // Deceleration Overrun return to idle (1.2s)
    this.osc1.frequency.exponentialRampToValueAtTime(85, t + 2.2);
    this.osc2.frequency.exponentialRampToValueAtTime(42.5, t + 2.2);
    this.osc3.frequency.exponentialRampToValueAtTime(170, t + 2.2);
    this.exhaustFilter.frequency.exponentialRampToValueAtTime(450, t + 2.2);
    this.masterGain.gain.linearRampToValueAtTime(0.35, t + 2.2);

    // Animate RPM value
    const startT = performance.now();
    const animateRev = (now) => {
      const elapsed = (now - startT) / 1000;
      if (elapsed < 0.8) {
        // Accelerating
        this.currentRPM = Math.round(950 + (elapsed / 0.8) * 8550);
      } else if (elapsed < 1.0) {
        // Limiter bounce
        this.currentRPM = Math.round(9300 + Math.random() * 200);
      } else if (elapsed < 2.2) {
        // Falling back to idle
        const decay = (elapsed - 1.0) / 1.2;
        this.currentRPM = Math.round(9500 - decay * 8550);
      } else {
        this.currentRPM = 950;
        this.isRevving = false;
        return;
      }
      if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);
      if (this.isRevving) requestAnimationFrame(animateRev);
    };
    requestAnimationFrame(animateRev);
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(0, t + 0.4);
    setTimeout(() => {
      try {
        if (this.osc1) this.osc1.stop();
        if (this.osc2) this.osc2.stop();
        if (this.osc3) this.osc3.stop();
      } catch {
        // ignore if already stopped
      }
      this.isPlaying = false;
      this.isRevving = false;
      this.currentRPM = 0;
      if (this.onRPMUpdate) this.onRPMUpdate(0);
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }, 450);
  }

  updateRPMLoop() {
    const loop = () => {
      if (!this.isPlaying) return;
      if (!this.isRevving) {
        // Subtle idle flutter between 920 and 970 RPM
        this.currentRPM = Math.round(945 + (Math.sin(Date.now() / 200) * 25));
        if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }
}

export const v12Engine = new V12EngineSynthesizer();
