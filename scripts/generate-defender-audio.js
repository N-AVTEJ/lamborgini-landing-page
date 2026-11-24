import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;
const SOURCE_RATE = 22050;

// Load real Defender V8 PCM recordings
const samplesPath = path.resolve(__dirname, 'defender-samples.json');
let rawData;
if (fs.existsSync(samplesPath)) {
  rawData = JSON.parse(fs.readFileSync(samplesPath, 'utf8'));
} else {
  throw new Error('defender-samples.json missing. Cannot synthesize real Defender audio.');
}

// Convert signed 8-bit PCM [-128..127] to Float32 [-1.0..1.0]
function toFloat32(arr) {
  const f32 = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    f32[i] = arr[i] / 128.0;
  }
  return f32;
}

const sampleBuffers = {
  start: toFloat32(rawData.start),
  openStart: toFloat32(rawData.openStart),
  idle: toFloat32(rawData.idle),
  openIdle: toFloat32(rawData.openIdle),
  rev: toFloat32(rawData.rev),
  rev2: toFloat32(rawData.rev2),
  knock: toFloat32(rawData.knock)
};

// Interpolated sample reader with loop wrapping
function readSampleHermite(buffer, index) {
  const len = buffer.length;
  const idx = ((index % len) + len) % len;
  const i0 = Math.floor(idx);
  const frac = idx - i0;
  const i1 = (i0 + 1) % len;
  // Linear interpolation with smooth Hermite curve
  const s0 = buffer[i0];
  const s1 = buffer[i1];
  const t = frac * frac * (3 - 2 * frac);
  return s0 + (s1 - s0) * t;
}

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
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
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

// Warm soft saturation for quad exhaust rumble
function softSaturate(x, drive = 1.4) {
  const v = x * drive;
  return Math.tanh(v) * 0.96;
}

// 1. GENERATE AUTHENTIC DEFENDER V8 STARTUP WAV
function generateDefenderStart() {
  const duration = 4.0; // 4 seconds
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  let idlePhase = 0;
  let revPhase = 0;
  let subPhase = 0;
  let turboPhase = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sL = 0;
    let sR = 0;

    if (t < 0.85) {
      // PHASE 1: Starter motor cranking pulses from real Defender OpenStart
      // Relay solenoid click at t = 0.03s
      if (t > 0.028 && t < 0.045) {
        const click = Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-(t - 0.028) * 320);
        sL += click * 0.45;
        sR += click * 0.40;
      }

      // Real starter crank sample progression
      const crankSrcIdx = (t * SOURCE_RATE);
      const crankVal = readSampleHermite(sampleBuffers.openStart, crankSrcIdx);

      // Starter armature electric whine (~148Hz & ~296Hz)
      const starterArmature = (Math.sin(2 * Math.PI * 148 * t) * 0.12 + Math.sin(2 * Math.PI * 296 * t) * 0.06);

      const blendIn = Math.min(1, t * 18);
      const starterSignal = (crankVal * 0.88 + starterArmature) * blendIn;
      sL += starterSignal;
      sR += starterSignal * 0.95;
    } else if (t < 1.6) {
      // PHASE 2: Ignition burst and flare to 1,450 RPM
      const flareProgress = (t - 0.85) / 0.75;
      const rpm = 380 + Math.sin(flareProgress * Math.PI * 0.85) * 1100;
      const rateMultiplier = (rpm / 750) * (SOURCE_RATE / SAMPLE_RATE);

      revPhase += rateMultiplier;
      subPhase += (2 * Math.PI * (rpm / 60) * 2) / SAMPLE_RATE;

      const rev1Val = readSampleHermite(sampleBuffers.rev, revPhase);
      const rev2Val = readSampleHermite(sampleBuffers.rev2, revPhase * 1.01 + 50);
      const knockVal = readSampleHermite(sampleBuffers.knock, revPhase * 2);

      // Initial combustion blast wave
      const blastWave = Math.exp(-(t - 0.85) * 8) * Math.sin(2 * Math.PI * 58 * t) * 0.85;

      const cylinderMixL = rev1Val * 0.6 + rev2Val * 0.35 + knockVal * 0.4 + blastWave;
      const cylinderMixR = rev2Val * 0.6 + rev1Val * 0.35 + knockVal * 0.38 + blastWave;

      sL += cylinderMixL;
      sR += cylinderMixR;
    } else {
      // PHASE 3: Settling from 1,450 RPM to deep 750 RPM Defender V8 Idle
      const settleProgress = Math.min(1, (t - 1.6) / 1.4);
      const rpm = 1150 - settleProgress * 400 + Math.sin(t * 8.5) * 12;
      const rateMultiplier = (rpm / 750) * (SOURCE_RATE / SAMPLE_RATE);

      idlePhase += rateMultiplier;
      subPhase += (2 * Math.PI * (rpm / 60) * 2) / SAMPLE_RATE;
      turboPhase += (2 * Math.PI * 1800) / SAMPLE_RATE;

      const idleValL = readSampleHermite(sampleBuffers.idle, idlePhase);
      const idleValR = readSampleHermite(sampleBuffers.idle, idlePhase + 6); // slight stereo Haas delay
      const knockVal = readSampleHermite(sampleBuffers.knock, idlePhase * 1.5);
      const subRumble = Math.sin(subPhase) * 0.18;
      const turboWhistle = Math.sin(turboPhase) * 0.012;

      sL += (idleValL * 0.72 + knockVal * 0.28 + subRumble + turboWhistle) * 0.85;
      sR += (idleValR * 0.72 + knockVal * 0.28 + subRumble + turboWhistle) * 0.85;
    }

    // Warm analog saturation
    left[i] = softSaturate(sL, 1.45);
    right[i] = softSaturate(sR, 1.45);
  }

  return createWavBuffer(left, right);
}

// 2. GENERATE AUTHENTIC DEFENDER V8 IDLE LOOP WAV
function generateDefenderIdleLoop() {
  const duration = 4.0; // 4 seconds
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  let idlePhase = 0;
  let subPhase = 0;
  let turboPhase = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Natural warm V8 idle breathing flutter (744 to 762 RPM)
    const rpm = 750 + Math.sin(t * Math.PI * 1.2) * 8 + Math.cos(t * Math.PI * 2.8) * 5;
    const rateMultiplier = (rpm / 750) * (SOURCE_RATE / SAMPLE_RATE);

    idlePhase += rateMultiplier;
    subPhase += (2 * Math.PI * (rpm / 60) * 2) / SAMPLE_RATE; // ~25Hz sub rumble
    turboPhase += (2 * Math.PI * 1750) / SAMPLE_RATE;

    const idleValL = readSampleHermite(sampleBuffers.idle, idlePhase);
    const idleValR = readSampleHermite(sampleBuffers.idle, idlePhase + 8);
    const knockVal = readSampleHermite(sampleBuffers.knock, idlePhase * 1.5);
    const subBass = Math.sin(subPhase) * 0.22;
    const turboWhistle = Math.sin(turboPhase) * 0.012;

    const sL = (idleValL * 0.75 + knockVal * 0.25 + subBass + turboWhistle) * 0.88;
    const sR = (idleValR * 0.75 + knockVal * 0.25 + subBass + turboWhistle) * 0.88;

    left[i] = softSaturate(sL, 1.35);
    right[i] = softSaturate(sR, 1.35);
  }

  // Seamless crossfade endpoints (250ms) to ensure click-free looping
  const crossfadeSamples = Math.floor(0.25 * SAMPLE_RATE);
  for (let i = 0; i < crossfadeSamples; i++) {
    const fadeIn = i / crossfadeSamples;
    const fadeOut = 1 - fadeIn;
    const endIdx = totalSamples - crossfadeSamples + i;

    left[i] = left[i] * fadeIn + left[endIdx] * fadeOut;
    right[i] = right[i] * fadeIn + right[endIdx] * fadeOut;
  }

  return createWavBuffer(left, right);
}

// 3. GENERATE AUTHENTIC DEFENDER V8 THROTTLE REV + OVERRUN CRACKLES WAV
function generateDefenderRev() {
  const duration = 3.8; // 3.8 seconds
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  let revPhase1 = 0;
  let revPhase2 = 0;
  let subPhase = 0;
  let turboPhase = 0;

  // Overrun deceleration unburnt fuel pops in quad exhaust
  const overrunPops = [
    { time: 1.52, amp: 1.25, freq: 1050, width: 0.075 },
    { time: 1.68, amp: 1.45, freq: 880, width: 0.080 },
    { time: 1.84, amp: 1.10, freq: 1250, width: 0.065 },
    { time: 2.05, amp: 1.38, freq: 920, width: 0.075 },
    { time: 2.22, amp: 1.15, freq: 1180, width: 0.070 },
    { time: 2.45, amp: 0.95, freq: 790, width: 0.080 },
    { time: 2.70, amp: 0.75, freq: 850, width: 0.065 }
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let rpm = 750;
    let throttleLoad = 0.2;

    if (t < 0.12) {
      // 1. Tip-in intake breath
      const p = t / 0.12;
      rpm = 750 + p * 350;
      throttleLoad = 0.35 + p * 0.3;
    } else if (t < 0.95) {
      // 2. Wide open throttle pull up to 7,200 RPM redline
      const p = (t - 0.12) / 0.83;
      rpm = 1100 + Math.pow(p, 1.35) * 6100;
      throttleLoad = 1.0;
    } else if (t < 1.35) {
      // 3. Rev limiter bounce at 7,200 RPM (26Hz fuel cut flutter)
      const limiterCycle = ((t - 0.95) * 26) % 1.0;
      rpm = 7080 + Math.sin(limiterCycle * Math.PI * 2) * 190;
      throttleLoad = limiterCycle < 0.45 ? 1.0 : 0.05;
    } else {
      // 4. Deceleration overrun back to idle (1.35s to 3.8s)
      const p = Math.min(1, (t - 1.35) / 2.0);
      rpm = 7200 - Math.pow(p, 0.72) * 6450;
      throttleLoad = 0.05;
    }

    const rateMultiplier = (rpm / 750) * (SOURCE_RATE / SAMPLE_RATE);
    revPhase1 += rateMultiplier;
    revPhase2 += rateMultiplier * 1.015;
    subPhase += (2 * Math.PI * (rpm / 60) * 2) / SAMPLE_RATE;
    const turboFreq = 1100 + (rpm / 7200) * 4200;
    turboPhase += (2 * Math.PI * turboFreq) / SAMPLE_RATE;

    // Resample real Defender V8 Rev & Rev2 recordings
    const rev1Val = readSampleHermite(sampleBuffers.rev, revPhase1);
    const rev2Val = readSampleHermite(sampleBuffers.rev2, revPhase2);
    const knockVal = readSampleHermite(sampleBuffers.knock, revPhase1 * 1.8);
    const subBass = Math.sin(subPhase) * (0.2 + throttleLoad * 0.25);
    const turboWhistle = Math.sin(turboPhase) * (0.015 + throttleLoad * 0.06);

    // Dynamic bank mixing
    let sL = (rev1Val * 0.55 + rev2Val * 0.45 + knockVal * (0.25 + throttleLoad * 0.3) + subBass + turboWhistle);
    let sR = (rev2Val * 0.55 + rev1Val * 0.45 + knockVal * (0.25 + throttleLoad * 0.3) + subBass + turboWhistle);

    // Overrun pops & crackles on deceleration
    for (const pop of overrunPops) {
      if (t >= pop.time && t < pop.time + pop.width) {
        const popAge = t - pop.time;
        const env = Math.exp(-popAge * 85);
        const crackle = (Math.random() * 2 - 1) * 0.75 + Math.sin(2 * Math.PI * pop.freq * popAge) * 0.8;
        const subThump = Math.sin(2 * Math.PI * 95 * popAge) * 0.95;
        const popSample = (crackle * 0.65 + subThump) * env * pop.amp;
        sL += popSample;
        sR += popSample * 0.9;
      }
    }

    // Drive increases with throttle load for vicious roar
    const drive = 1.4 + throttleLoad * 1.2;
    left[i] = softSaturate(sL, drive);
    right[i] = softSaturate(sR, drive);
  }

  return createWavBuffer(left, right);
}

const audioDirs = [
  path.resolve(__dirname, '../public/audio'),
  path.resolve(__dirname, '../dist/audio')
];

for (const dir of audioDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

console.log('Generating Authentic Land Rover Defender V8 Audio Files...');

const startWav = generateDefenderStart();
const revWav = generateDefenderRev();
const idleWav = generateDefenderIdleLoop();

for (const dir of audioDirs) {
  fs.writeFileSync(path.join(dir, 'defender-v8-start.wav'), startWav);
  fs.writeFileSync(path.join(dir, 'defender-v8-rev.wav'), revWav);
  fs.writeFileSync(path.join(dir, 'defender-v8-idle.wav'), idleWav);
}

console.log('✓ Successfully generated defender-v8-start.wav (' + (startWav.length / 1024).toFixed(1) + ' KB)');
console.log('✓ Successfully generated defender-v8-rev.wav (' + (revWav.length / 1024).toFixed(1) + ' KB)');
console.log('✓ Successfully generated defender-v8-idle.wav (' + (idleWav.length / 1024).toFixed(1) + ' KB)');
console.log('All real Land Rover Defender V8 audio files compiled into public/audio & dist/audio!');