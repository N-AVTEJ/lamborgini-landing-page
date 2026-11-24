import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;

function createWavBuffer(leftChannel, rightChannel) {
  const numSamples = leftChannel.length;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Clamp to [-1, 1]
    const l = Math.max(-1, Math.min(1, leftChannel[i]));
    const r = Math.max(-1, Math.min(1, rightChannel[i]));

    const intL = l < 0 ? Math.round(l * 32768) : Math.round(l * 32767);
    const intR = r < 0 ? Math.round(r * 32768) : Math.round(r * 32767);

    buffer.writeInt16LE(intL, offset);
    buffer.writeInt16LE(intR, offset + 2);
    offset += 4;
  }

  return buffer;
}

// Soft saturation curve for authentic exhaust roar warmth
function softClip(x, drive = 1.8) {
  const v = x * drive;
  return Math.tanh(v) * 0.95;
}

// Lowpass filter state helper
class SimpleBiquad {
  constructor(type, freq, Q = 1.0) {
    this.type = type;
    this.freq = freq;
    this.Q = Q;
    this.x1 = 0; this.x2 = 0;
    this.y1 = 0; this.y2 = 0;
    this.updateCoeffs();
  }

  setFreq(freq) {
    this.freq = Math.max(20, Math.min(SAMPLE_RATE * 0.48, freq));
    this.updateCoeffs();
  }

  updateCoeffs() {
    const w0 = (2 * Math.PI * this.freq) / SAMPLE_RATE;
    const alpha = Math.sin(w0) / (2 * this.Q);
    const cosw0 = Math.cos(w0);

    if (this.type === 'lowpass') {
      const b0 = (1 - cosw0) / 2;
      const b1 = 1 - cosw0;
      const b2 = (1 - cosw0) / 2;
      const a0 = 1 + alpha;
      const a1 = -2 * cosw0;
      const a2 = 1 - alpha;
      this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
      this.a1 = a1 / a0; this.a2 = a2 / a0;
    } else if (this.type === 'bandpass') {
      const b0 = alpha;
      const b1 = 0;
      const b2 = -alpha;
      const a0 = 1 + alpha;
      const a1 = -2 * cosw0;
      const a2 = 1 - alpha;
      this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
      this.a1 = a1 / a0; this.a2 = a2 / a0;
    }
  }

  process(sample) {
    const out = this.b0 * sample + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = sample;
    this.y2 = this.y1;
    this.y1 = out;
    return out;
  }
}

// Generate Realistic Land Rover Defender Start + Idle Audio
function generateDefenderStart() {
  const duration = 3.8; // seconds
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  let phaseV8_1 = 0;
  let phaseV8_2 = 0;
  let phaseV8_3 = 0;
  let phaseSub = 0;
  let phaseTurbo = 0;

  const lowpassL = new SimpleBiquad('lowpass', 550, 2.2);
  const lowpassR = new SimpleBiquad('lowpass', 550, 2.2);

  // Crossplane V8 firing intervals for 8 cylinders:
  // Bank separation: 0, 90, 270, 360, 450, 630 degrees

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sL = 0;
    let sR = 0;

    if (t < 0.85) {
      // 1. STARTER MOTOR CRANK PHASE (0.0s to 0.85s)
      // Starter relay metallic click at t = 0.04
      if (t > 0.03 && t < 0.05) {
        const click = Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-(t - 0.03) * 300);
        sL += click * 0.4;
        sR += click * 0.35;
      }

      // Starter motor high-pitched armature whine
      const starterWhine = Math.sin(2 * Math.PI * 145 * t) * 0.18 + Math.sin(2 * Math.PI * 290 * t) * 0.08;

      // Heavy 3.5 Hz starter compression chug (piston stroke compression)
      const crankCycle = (t * 3.8) % 1.0;
      const compressionPulse = Math.pow(Math.sin(crankCycle * Math.PI), 8) * Math.sin(2 * Math.PI * 42 * t);

      // Starter chug noise
      const mechanicalNoise = (Math.random() * 2 - 1) * 0.04;

      const starterMix = (starterWhine + compressionPulse * 0.7 + mechanicalNoise) * Math.min(1, t * 15);
      sL += starterMix * 0.75;
      sR += starterMix * 0.70;
    } else if (t < 1.4) {
      // 2. IGNITION FLARE PHASE (0.85s to 1.4s)
      // Sudden burst of combustion, engine catches and revs up to ~1450 RPM
      const flareProgress = (t - 0.85) / 0.55;
      const rpm = 350 + Math.sin(flareProgress * Math.PI * 0.85) * 1150;
      const firingFreq = (rpm / 60) * 4; // V8 firing pulses / sec

      phaseV8_1 += (2 * Math.PI * firingFreq) / SAMPLE_RATE;
      phaseV8_2 += (2 * Math.PI * firingFreq * 2) / SAMPLE_RATE;
      phaseSub += (2 * Math.PI * (firingFreq * 0.5)) / SAMPLE_RATE;

      // Combustion pulses with crossplane asymmetry
      const cylinderPulseL = Math.sin(phaseV8_1) + 0.6 * Math.sin(phaseV8_2) + 0.4 * Math.sin(phaseSub);
      const cylinderPulseR = Math.sin(phaseV8_1 + 0.78) + 0.6 * Math.sin(phaseV8_2 + 1.57) + 0.4 * Math.sin(phaseSub + 0.39);

      // Ignition initial explosion boom
      const initialBlast = Math.exp(-(t - 0.85) * 6) * Math.sin(2 * Math.PI * 65 * t);
      const exhaustRush = (Math.random() * 2 - 1) * 0.12 * Math.exp(-(t - 0.85) * 4);

      sL += cylinderPulseL * 0.65 + initialBlast * 0.8 + exhaustRush;
      sR += cylinderPulseR * 0.65 + initialBlast * 0.7 + exhaustRush;
    } else {
      // 3. SETTLING TO DEEP GUTTURAL DEFENDER V8 IDLE (1.4s to 3.8s)
      // Settles smoothly from 1100 to 750 RPM
      const settleProgress = Math.min(1, (t - 1.4) / 1.0);
      const rpm = 1100 - settleProgress * 350 + Math.sin(t * 8) * 15; // natural warm idle flutter
      const firingFreq = (rpm / 60) * 4; // ~50 Hz at 750 RPM

      phaseV8_1 += (2 * Math.PI * firingFreq) / SAMPLE_RATE;
      phaseV8_2 += (2 * Math.PI * firingFreq * 2) / SAMPLE_RATE;
      phaseV8_3 += (2 * Math.PI * firingFreq * 3) / SAMPLE_RATE;
      phaseSub += (2 * Math.PI * (firingFreq * 0.5)) / SAMPLE_RATE; // deep 25Hz sub-rumble
      phaseTurbo += (2 * Math.PI * 1850) / SAMPLE_RATE; // faint turbo turbine whistle

      // Crossplane syncopation: asymmetric bank pulsation
      const bankL = Math.sin(phaseV8_1) * 0.5 + Math.sin(phaseV8_2) * 0.3 + Math.sin(phaseSub) * 0.4;
      const bankR = Math.sin(phaseV8_1 + 0.85) * 0.5 + Math.sin(phaseV8_2 + 1.7) * 0.3 + Math.sin(phaseSub + 0.42) * 0.4;

      // Exhaust pipe backpressure chuff
      const chuff = Math.pow(Math.max(0, Math.sin(phaseV8_1 * 0.5)), 4) * (Math.random() * 0.15);
      const turboWhistle = Math.sin(phaseTurbo) * 0.015;

      sL += (bankL + chuff + turboWhistle) * 0.7;
      sR += (bankR + chuff * 0.8 + turboWhistle) * 0.7;
    }

    // Filter and warm saturate
    const outL = softClip(lowpassL.process(sL), 2.2);
    const outR = softClip(lowpassR.process(sR), 2.2);

    left[i] = outL;
    right[i] = outR;
  }

  return createWavBuffer(left, right);
}

// Generate Realistic Land Rover Defender Throttle Rev Roar + Overrun Pops
function generateDefenderRev() {
  const duration = 3.6; // seconds
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  let phaseV8_1 = 0;
  let phaseV8_2 = 0;
  let phaseV8_3 = 0;
  let phaseSub = 0;
  let phaseTurbo = 0;

  const lowpassL = new SimpleBiquad('lowpass', 600, 2.5);
  const lowpassR = new SimpleBiquad('lowpass', 600, 2.5);

  // Pop burst locations during overrun deceleration (seconds)
  const pops = [
    { time: 1.55, amp: 1.1, freq: 1100 },
    { time: 1.72, amp: 1.35, freq: 850 },
    { time: 1.88, amp: 0.95, freq: 1300 },
    { time: 2.12, amp: 1.25, freq: 950 },
    { time: 2.30, amp: 0.85, freq: 1150 },
    { time: 2.52, amp: 0.70, freq: 780 }
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let rpm = 750;
    let throttleLoad = 0.2;

    if (t < 0.15) {
      // Tip-in intake breath
      rpm = 750 + (t / 0.15) * 300;
      throttleLoad = 0.4;
    } else if (t < 0.95) {
      // Full throttle roar up to 7,200 RPM redline
      const p = (t - 0.15) / 0.80;
      // Exponential throttle sweep
      rpm = 1050 + Math.pow(p, 1.35) * 6150;
      throttleLoad = 1.0;
    } else if (t < 1.35) {
      // Limiter bounce at 7,200 RPM
      const limiterCycle = ((t - 0.95) * 26) % 1.0;
      rpm = 7050 + Math.sin(limiterCycle * Math.PI * 2) * 220;
      throttleLoad = limiterCycle < 0.5 ? 1.0 : 0.1;
    } else {
      // Deceleration overrun back down to idle (1.35s to 3.6s)
      const p = Math.min(1, (t - 1.35) / 1.85);
      rpm = 7200 - Math.pow(p, 0.7) * 6450;
      throttleLoad = 0.05;
    }

    const firingFreq = (rpm / 60) * 4; // V8 firing pulses / sec: 50Hz to 480Hz
    const cutoffFreq = Math.min(6500, 450 + (rpm / 7200) * 4200);
    lowpassL.setFreq(cutoffFreq);
    lowpassR.setFreq(cutoffFreq);

    phaseV8_1 += (2 * Math.PI * firingFreq) / SAMPLE_RATE;
    phaseV8_2 += (2 * Math.PI * firingFreq * 2) / SAMPLE_RATE;
    phaseV8_3 += (2 * Math.PI * firingFreq * 3) / SAMPLE_RATE;
    phaseSub += (2 * Math.PI * (firingFreq * 0.5)) / SAMPLE_RATE;
    // Turbo whine tracks RPM
    const turboFreq = 1200 + (rpm / 7200) * 3800;
    phaseTurbo += (2 * Math.PI * turboFreq) / SAMPLE_RATE;

    // Rich crossplane harmonics
    // Sawtooth-like sharp exhaust pulse
    const sawHarmonic = Math.sin(phaseV8_1) + 0.55 * Math.sin(phaseV8_2) + 0.35 * Math.sin(phaseV8_3);
    const subBass = Math.sin(phaseSub) * 0.45;
    const turboWhistle = Math.sin(phaseTurbo) * (0.02 + throttleLoad * 0.07);

    // Rough combustion texture
    const combustionNoise = (Math.random() * 2 - 1) * (0.05 + throttleLoad * 0.15);

    let sL = (sawHarmonic * 0.65 + subBass + turboWhistle + combustionNoise);
    let sR = (Math.sin(phaseV8_1 + 0.82) * 0.65 + 0.55 * Math.sin(phaseV8_2 + 1.64) + subBass + turboWhistle + combustionNoise);

    // OVERRUN CRACKLES & POPS (Deceleration unburnt fuel pops in quad exhaust)
    for (const pop of pops) {
      if (t >= pop.time && t < pop.time + 0.065) {
        const popAge = t - pop.time;
        // Fast explosive transient
        const popEnv = Math.exp(-popAge * 90);
        const popWave = Math.sin(2 * Math.PI * pop.freq * popAge) + (Math.random() * 2 - 1) * 0.8;
        const thump = Math.sin(2 * Math.PI * 110 * popAge) * 0.9;
        const popSample = (popWave * 0.7 + thump) * popEnv * pop.amp;
        sL += popSample;
        sR += popSample * 0.92;
      }
    }

    // Drive increases with throttle load for vicious roar
    const drive = 1.8 + throttleLoad * 1.5;
    const outL = softClip(lowpassL.process(sL), drive);
    const outR = softClip(lowpassR.process(sR), drive);

    left[i] = outL;
    right[i] = outR;
  }

  return createWavBuffer(left, right);
}

// Generate Realistic Defender V8 Idle Loop
function generateDefenderIdleLoop() {
  const duration = 4.0; // seconds
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  let phaseV8_1 = 0;
  let phaseV8_2 = 0;
  let phaseSub = 0;
  let phaseTurbo = 0;

  const lowpassL = new SimpleBiquad('lowpass', 480, 2.0);
  const lowpassR = new SimpleBiquad('lowpass', 480, 2.0);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Natural idle rpm modulation ~745 to 765 RPM
    const rpm = 750 + Math.sin(t * Math.PI * 1.5) * 12 + Math.cos(t * Math.PI * 2.7) * 8;
    const firingFreq = (rpm / 60) * 4;

    phaseV8_1 += (2 * Math.PI * firingFreq) / SAMPLE_RATE;
    phaseV8_2 += (2 * Math.PI * firingFreq * 2) / SAMPLE_RATE;
    phaseSub += (2 * Math.PI * (firingFreq * 0.5)) / SAMPLE_RATE;
    phaseTurbo += (2 * Math.PI * 1750) / SAMPLE_RATE;

    const bankL = Math.sin(phaseV8_1) * 0.55 + Math.sin(phaseV8_2) * 0.28 + Math.sin(phaseSub) * 0.45;
    const bankR = Math.sin(phaseV8_1 + 0.85) * 0.55 + Math.sin(phaseV8_2 + 1.7) * 0.28 + Math.sin(phaseSub + 0.42) * 0.45;

    const chuff = Math.pow(Math.max(0, Math.sin(phaseV8_1 * 0.5)), 4) * (Math.random() * 0.12);
    const turboWhistle = Math.sin(phaseTurbo) * 0.012;

    const sL = (bankL + chuff + turboWhistle) * 0.7;
    const sR = (bankR + chuff * 0.8 + turboWhistle) * 0.7;

    left[i] = softClip(lowpassL.process(sL), 2.0);
    right[i] = softClip(lowpassR.process(sR), 2.0);
  }

  // Crossfade ends to make perfectly seamless loop
  const crossfadeSamples = Math.floor(0.2 * SAMPLE_RATE);
  for (let i = 0; i < crossfadeSamples; i++) {
    const fadeOut = (crossfadeSamples - i) / crossfadeSamples;
    const fadeIn = i / crossfadeSamples;
    const endIdx = totalSamples - crossfadeSamples + i;

    left[i] = left[i] * fadeIn + left[endIdx] * fadeOut;
    right[i] = right[i] * fadeIn + right[endIdx] * fadeOut;
  }

  return createWavBuffer(left, right);
}

const audioDir = path.resolve(__dirname, '../public/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

console.log('Generating Land Rover Defender V8 Audio Files in', audioDir);

const startWav = generateDefenderStart();
fs.writeFileSync(path.join(audioDir, 'defender-v8-start.wav'), startWav);
console.log('✓ Created defender-v8-start.wav (' + (startWav.length / 1024).toFixed(1) + ' KB)');

const revWav = generateDefenderRev();
fs.writeFileSync(path.join(audioDir, 'defender-v8-rev.wav'), revWav);
console.log('✓ Created defender-v8-rev.wav (' + (revWav.length / 1024).toFixed(1) + ' KB)');

const idleWav = generateDefenderIdleLoop();
fs.writeFileSync(path.join(audioDir, 'defender-v8-idle.wav'), idleWav);
console.log('✓ Created defender-v8-idle.wav (' + (idleWav.length / 1024).toFixed(1) + ' KB)');

console.log('All Defender V8 authentic audio files successfully generated!');
