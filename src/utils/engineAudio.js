// Authentic Web Audio System & Recorded Engine Audio for Land Rover Defender V8 (OCTA / Supercharged V8)
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

    // Recorded Audio Buffers for real Defender V8 sound
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
    this.preloadAudioClips();
  }

  // Preload authentic Land Rover Defender audio clips from /audio/ directory
  async preloadAudioClips() {
    if (this.isPreloading || this.hasRecordedAudio || !this.ctx) return;
    if (typeof fetch !== 'function' || typeof this.ctx.decodeAudioData !== 'function') return;

    this.isPreloading = true;
    const audioFiles = [
      { key: 'start', url: '/audio/defender-v8-start.wav' },
      { key: 'rev', url: '/audio/defender-v8-rev.wav' },
      { key: 'idle', url: '/audio/defender-v8-idle.wav' }
    ];

    try {
      await Promise.all(
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
      );
      if (this.audioBuffers.start && this.audioBuffers.rev) {
        this.hasRecordedAudio = true;
      }
    } catch {
      // Gracefully fall back to acoustic synthesis
    } finally {
      this.isPreloading = false;
    }
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

  startIdle(onRPM) {
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

    const t = this.ctx.currentTime || 0;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    if (this.masterGain && this.masterGain.gain && this.masterGain.gain.setValueAtTime) {
      this.masterGain.gain.setValueAtTime(0, t);
      this.masterGain.gain.linearRampToValueAtTime(0.45, t + 0.4);
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
          this.currentRPM = Math.round(200 + Math.sin(elapsed * 24) * 35);
        } else if (elapsed < 1.4) {
          // Ignition flare spike up to 1,450 RPM
          const flareProgress = (elapsed - 0.85) / 0.55;
          this.currentRPM = Math.round(220 + Math.sin(flareProgress * Math.PI * 0.85) * 1230);
        } else if (elapsed < 3.2) {
          // Settling to idle
          const settleProgress = (elapsed - 1.4) / 1.8;
          this.currentRPM = Math.round(1450 - settleProgress * 700 + Math.sin(elapsed * 8) * 15);
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
        if (this.isPlaying && !this.isRevving && this.audioBuffers.idle) {
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

    // Third Osc for turbo induction whistle / supercharger whine (~110Hz)
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
    this.startIdleLoop();
  }

  revEngine() {
    // Guard against re-triggering while a rev sweep is already in progress
    if (!this.isPlaying || !this.ctx || this.isRevving) return;
    this.isRevving = true;
    const t = this.ctx.currentTime || 0;

    // Check if recorded rev audio is available
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
          this.isRevving = false;
          if (this.isPlaying && this.audioBuffers.idle) {
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
    }

    // If using acoustic synthesis oscillators, schedule audio parameters
    if (this.osc1 && this.osc1.frequency && this.osc1.frequency.cancelScheduledValues) {
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
      if (elapsed < 0.75) {
        // Accelerating towards 7,200 RPM redline
        this.currentRPM = Math.round(750 + Math.pow(elapsed / 0.75, 1.25) * 6450);
      } else if (elapsed < 1.05) {
        // Limiter bounce flutter (7,050 to 7,250 RPM)
        this.currentRPM = Math.round(7100 + Math.sin(now / 20) * 120);
      } else if (elapsed < 2.4) {
        // Deceleration overrun return to idle
        const decay = Math.min(1, (elapsed - 1.05) / 1.35);
        this.currentRPM = Math.round(7200 - Math.pow(decay, 0.75) * 6450);
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

    const t = this.ctx.currentTime || 0;
    try {
      if (this.masterGain && this.masterGain.gain && this.masterGain.gain.cancelScheduledValues) {
        this.masterGain.gain.cancelScheduledValues(t);
        this.masterGain.gain.linearRampToValueAtTime(0, t + 0.3);
      }
    } catch {
      // fallback
    }

    // Stop recorded buffer sources
    Object.keys(this.activeSources).forEach((key) => {
      if (this.activeSources[key]) {
        try {
          this.activeSources[key].stop();
          this.activeSources[key].disconnect();
        } catch {}
        this.activeSources[key] = null;
      }
    });

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
    }, 350);
  }

  startIdleLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const loop = () => {
      if (!this.isPlaying) return;
      if (!this.isRevving) {
        // Subtle V8 idle flutter between 730 and 770 RPM
        this.currentRPM = Math.round(750 + (Math.sin(Date.now() / 240) * 18));
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
