// Authentic Web Audio System & Real Recorded Engine Audio for Land Rover Defender V8 (OCTA / Supercharged V8)
class DefenderV8EngineSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isRevving = false;
    this.currentRPM = 0;
    this.onRPMUpdate = null;
    this.animFrameId = null;
    this.revAnimFrameId = null;
    this.stopTimeoutId = null;
    this.preloadPromise = null;

    // Recorded Audio Buffers from authentic Land Rover Defender V8
    this.audioBuffers = {
      start: null,
      rev: null,
      idle: null
    };
    this.activeSources = {
      start: null,
      rev: null,
      idle: null
    };
    this.hasRecordedAudio = false;
    this.isPreloading = false;

    // Start preloading immediately in browser environments
    if (typeof window !== 'undefined') {
      setTimeout(() => this.preloadAudioClips(), 0);
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.hasRecordedAudio && !this.isPreloading) {
      this.preloadAudioClips();
    }
  }

  // Preload authentic Land Rover Defender audio clips from /audio/ directory
  preloadAudioClips() {
    if (this.hasRecordedAudio) return Promise.resolve(true);
    if (this.preloadPromise) return this.preloadPromise;

    if (typeof window === 'undefined') return Promise.resolve(false);
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (!this.ctx || typeof fetch !== 'function' || typeof this.ctx.decodeAudioData !== 'function') {
      return Promise.resolve(false);
    }

    this.isPreloading = true;
    const audioFiles = [
      { key: 'start', url: '/audio/defender-v8-start.wav' },
      { key: 'rev', url: '/audio/defender-v8-rev.wav' },
      { key: 'idle', url: '/audio/defender-v8-idle.wav' }
    ];

    this.preloadPromise = Promise.all(
      audioFiles.map(async ({ key, url }) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const arrayBuffer = await res.arrayBuffer();
          const decoded = await this.ctx.decodeAudioData(arrayBuffer);
          this.audioBuffers[key] = decoded;
        } catch {
          // Gracefully fall back to acoustic synthesis
        }
      })
    )
      .then(() => {
        if (this.audioBuffers.start && this.audioBuffers.rev) {
          this.hasRecordedAudio = true;
        }
        return this.hasRecordedAudio;
      })
      .catch(() => false)
      .finally(() => {
        this.isPreloading = false;
      });

    return this.preloadPromise;
  }

  // Generate distortion curve for deep V8 exhaust growl
  makeDistortionCurve(amount = 25) {
    const k = typeof amount === 'number' ? amount : 25;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  async startIdle(onRPM) {
    this.init();
    if (this.stopTimeoutId) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.onRPMUpdate = onRPM;

    if (!this.ctx) {
      this.currentRPM = 750;
      if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);
      return;
    }

    // Await preload if in-flight (up to 300ms window)
    if (this.isPreloading && this.preloadPromise) {
      try {
        await Promise.race([
          this.preloadPromise,
          new Promise((resolve) => setTimeout(resolve, 300))
        ]);
      } catch {
        // continue
      }
    }

    if (!this.isPlaying) return; // in case stop was called during await

    const t = this.ctx.currentTime || 0;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    if (this.masterGain && this.masterGain.gain && this.masterGain.gain.setValueAtTime) {
      this.masterGain.gain.setValueAtTime(0, t);
      this.masterGain.gain.linearRampToValueAtTime(0.55, t + 0.35);
    }
    if (this.masterGain && this.ctx.destination && typeof this.masterGain.connect === 'function') {
      this.masterGain.connect(this.ctx.destination);
    }

    // Try playing real recorded Defender V8 starter audio if loaded
    if (this.hasRecordedAudio && this.audioBuffers.start && typeof this.ctx.createBufferSource === 'function') {
      this.playRecordedStartSequence();
    } else {
      // High-fidelity acoustic Web Audio synthesis fallback
      this.startAcousticSynthesis(t);
    }
  }

  playRecordedStartSequence() {
    const t = this.ctx.currentTime || 0;
    try {
      // Disconnect any lingering acoustic synthesis oscillators
      this.killAcousticOscillators();

      // Set initial starter cranking RPM
      this.currentRPM = 210;
      if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);

      // 1. Play Starter Crank + Ignition Audio Clip
      const startSrc = this.ctx.createBufferSource();
      startSrc.buffer = this.audioBuffers.start;
      startSrc.connect(this.masterGain);
      startSrc.start(t);
      this.activeSources.start = startSrc;

      // Animate RPM telemetry to match starter crank and ignition flare
      const startTime = performance.now();
      const crankAnim = (now) => {
        if (!this.isPlaying) return;
        const elapsed = (now - startTime) / 1000;
        if (elapsed < 0.85) {
          // Starter motor cranking pulses (180 - 240 RPM)
          this.currentRPM = Math.round(210 + Math.sin(elapsed * 24) * 35);
        } else if (elapsed < 1.6) {
          // Ignition flare spike up to 1,450 RPM
          const flareProgress = (elapsed - 0.85) / 0.75;
          this.currentRPM = Math.round(230 + Math.sin(flareProgress * Math.PI * 0.85) * 1220);
        } else if (elapsed < 3.4) {
          // Settling to idle
          const settleProgress = (elapsed - 1.6) / 1.8;
          this.currentRPM = Math.round(1450 - settleProgress * 700 + Math.sin(elapsed * 8.5) * 14);
        } else {
          // Settled at idle (750 RPM)
          this.currentRPM = 750;
          this.startIdleLoop();
          return;
        }
        if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);
        this.animFrameId = requestAnimationFrame(crankAnim);
      };
      this.animFrameId = requestAnimationFrame(crankAnim);

      // When start clip ends, loop recorded idle
      startSrc.onended = () => {
        this.activeSources.start = null;
        if (this.isPlaying && !this.isRevving && this.audioBuffers.idle && typeof this.ctx.createBufferSource === 'function') {
          try {
            const idleSrc = this.ctx.createBufferSource();
            idleSrc.buffer = this.audioBuffers.idle;
            idleSrc.loop = true;
            idleSrc.connect(this.masterGain);
            idleSrc.start(0);
            this.activeSources.idle = idleSrc;
          } catch {
            // fallback
          }
        }
      };
    } catch {
      this.startAcousticSynthesis(t);
    }
  }

  startAcousticSynthesis(t) {
    this.killAcousticOscillators();

    // Distortion shaper for deep British V8 growl
    this.shaper = this.ctx.createWaveShaper();
    if (this.shaper) {
      this.shaper.curve = this.makeDistortionCurve(24);
      this.shaper.oversample = '4x';
      if (this.masterGain) this.shaper.connect(this.masterGain);
    }

    // Exhaust resonator lowpass filter
    this.exhaustFilter = this.ctx.createBiquadFilter();
    this.exhaustFilter.type = 'lowpass';
    if (this.exhaustFilter.frequency && this.exhaustFilter.frequency.setValueAtTime) {
      this.exhaustFilter.frequency.setValueAtTime(380, t);
      this.exhaustFilter.Q.setValueAtTime(3.0, t);
    }
    if (this.shaper && typeof this.exhaustFilter.connect === 'function') {
      this.exhaustFilter.connect(this.shaper);
    } else if (this.masterGain && typeof this.exhaustFilter.connect === 'function') {
      this.exhaustFilter.connect(this.masterGain);
    }

    // Primary V8 Crossplane Sawtooth (~50-55Hz fundamental at idle)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    if (this.osc1.frequency && this.osc1.frequency.setValueAtTime) {
      this.osc1.frequency.setValueAtTime(55, t);
    }

    // Secondary Sub-Harmonic Rumble Osc (Deep engine block resonance ~27.5Hz)
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    if (this.osc2.frequency && this.osc2.frequency.setValueAtTime) {
      this.osc2.frequency.setValueAtTime(27.5, t);
    }

    // Third Osc for twin-turbo induction / supercharger whine (~110Hz)
    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = 'sawtooth';
    if (this.osc3.frequency && this.osc3.frequency.setValueAtTime) {
      this.osc3.frequency.setValueAtTime(110, t);
    }

    // Connect oscillators to filter
    if (typeof this.osc1.connect === 'function') this.osc1.connect(this.exhaustFilter);
    if (typeof this.osc2.connect === 'function') this.osc2.connect(this.exhaustFilter);
    if (typeof this.osc3.connect === 'function') this.osc3.connect(this.exhaustFilter);

    if (typeof this.osc1.start === 'function') this.osc1.start(t);
    if (typeof this.osc2.start === 'function') this.osc2.start(t);
    if (typeof this.osc3.start === 'function') this.osc3.start(t);

    this.currentRPM = 750;
    if (this.onRPMUpdate) this.onRPMUpdate(this.currentRPM);
    this.startIdleLoop();
  }

  killAcousticOscillators() {
    try {
      if (this.osc1) { this.osc1.stop(); this.osc1.disconnect(); }
      if (this.osc2) { this.osc2.stop(); this.osc2.disconnect(); }
      if (this.osc3) { this.osc3.stop(); this.osc3.disconnect(); }
    } catch {
      // ignore
    }
    this.osc1 = null;
    this.osc2 = null;
    this.osc3 = null;
  }

  revEngine() {
    // Guard against re-triggering while a rev sweep is already in progress
    if (!this.isPlaying || !this.ctx || this.isRevving) return;
    this.isRevving = true;
    const t = this.ctx.currentTime || 0;

    // Check if real recorded rev audio is available
    if (this.hasRecordedAudio && this.audioBuffers.rev && typeof this.ctx.createBufferSource === 'function') {
      try {
        // Stop current idle loop if playing
        if (this.activeSources.idle) {
          try { this.activeSources.idle.stop(); } catch {}
          this.activeSources.idle = null;
        }

        const revSrc = this.ctx.createBufferSource();
        revSrc.buffer = this.audioBuffers.rev;
        revSrc.connect(this.masterGain);
        revSrc.start(t);
        this.activeSources.rev = revSrc;

        revSrc.onended = () => {
          this.activeSources.rev = null;
          this.isRevving = false;
          if (this.isPlaying && this.audioBuffers.idle && typeof this.ctx.createBufferSource === 'function') {
            try {
              const idleSrc = this.ctx.createBufferSource();
              idleSrc.buffer = this.audioBuffers.idle;
              idleSrc.loop = true;
              idleSrc.connect(this.masterGain);
              idleSrc.start(0);
              this.activeSources.idle = idleSrc;
            } catch {}
          }
        };
      } catch {
        // Fall back to acoustic sweep
      }
    } else if (this.osc1 && this.osc1.frequency && this.osc1.frequency.cancelScheduledValues) {
      // Acoustic synthesis schedule ONLY when oscillators are active and recorded audio is not used
      this.osc1.frequency.cancelScheduledValues(t);
      this.osc2.frequency.cancelScheduledValues(t);
      this.osc3.frequency.cancelScheduledValues(t);
      this.exhaustFilter.frequency.cancelScheduledValues(t);
      this.masterGain.gain.cancelScheduledValues(t);

      // Aggressive V8 Acceleration Ramp (0.75s)
      this.osc1.frequency.linearRampToValueAtTime(580, t + 0.75);
      this.osc2.frequency.linearRampToValueAtTime(290, t + 0.75);
      this.osc3.frequency.linearRampToValueAtTime(1160, t + 0.75);
      this.exhaustFilter.frequency.exponentialRampToValueAtTime(2600, t + 0.75);
      this.masterGain.gain.linearRampToValueAtTime(0.58, t + 0.75);

      // Limiter bounce at 7,200 RPM with V8 flutter
      this.osc1.frequency.setValueAtTime(600, t + 0.8);
      this.osc1.frequency.setValueAtTime(560, t + 0.9);

      // Deceleration Overrun return to idle with crackles (1.2s)
      this.osc1.frequency.exponentialRampToValueAtTime(55, t + 2.2);
      this.osc2.frequency.exponentialRampToValueAtTime(27.5, t + 2.2);
      this.osc3.frequency.exponentialRampToValueAtTime(110, t + 2.2);
      this.exhaustFilter.frequency.exponentialRampToValueAtTime(380, t + 2.2);
      this.masterGain.gain.linearRampToValueAtTime(0.42, t + 2.2);
    }

    // Animate RPM telemetry smoothly for both recorded clip and acoustic model
    if (this.revAnimFrameId) cancelAnimationFrame(this.revAnimFrameId);

    const startT = performance.now();
    const animateRev = (now) => {
      const elapsed = (now - startT) / 1000;
      if (elapsed < 0.85) {
        // Accelerating towards 7,200 RPM redline
        this.currentRPM = Math.round(750 + Math.pow(elapsed / 0.85, 1.35) * 6450);
      } else if (elapsed < 1.25) {
        // Limiter bounce flutter (7,060 to 7,240 RPM)
        this.currentRPM = Math.round(7150 + Math.sin(now / 18) * 90);
      } else if (elapsed < 2.8) {
        // Deceleration overrun return to idle
        const decay = Math.min(1, (elapsed - 1.25) / 1.55);
        this.currentRPM = Math.round(7200 - Math.pow(decay, 0.72) * 6450);
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
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.isRevving = false;
    if (this.stopTimeoutId) clearTimeout(this.stopTimeoutId);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.revAnimFrameId) cancelAnimationFrame(this.revAnimFrameId);

    // Stop recorded buffer sources immediately
    Object.keys(this.activeSources).forEach((key) => {
      if (this.activeSources[key]) {
        try {
          this.activeSources[key].stop();
          this.activeSources[key].disconnect();
        } catch {}
        this.activeSources[key] = null;
      }
    });

    this.killAcousticOscillators();

    if (this.ctx) {
      const t = this.ctx.currentTime || 0;
      try {
        if (this.masterGain && this.masterGain.gain && this.masterGain.gain.cancelScheduledValues) {
          this.masterGain.gain.cancelScheduledValues(t);
          this.masterGain.gain.linearRampToValueAtTime(0, t + 0.15);
        }
      } catch {}
    }

    this.currentRPM = 0;
    if (this.onRPMUpdate) this.onRPMUpdate(0);
  }

  startIdleLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const loop = () => {
      if (!this.isPlaying) return;
      if (!this.isRevving) {
        // Subtle V8 idle flutter between 740 and 765 RPM
        this.currentRPM = Math.round(750 + (Math.sin(Date.now() / 220) * 14));
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