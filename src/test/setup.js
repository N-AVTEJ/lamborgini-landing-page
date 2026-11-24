import '@testing-library/jest-dom';

// Polyfill AudioContext for JSDOM
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
  }
  resume() { return Promise.resolve(); }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        cancelScheduledValues: () => {}
      },
      connect: () => {}
    };
  }
  createWaveShaper() {
    return {
      curve: null,
      oversample: 'none',
      connect: () => {}
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        cancelScheduledValues: () => {}
      },
      Q: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createOscillator() {
    return {
      type: 'sawtooth',
      frequency: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        cancelScheduledValues: () => {}
      },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
}

window.AudioContext = MockAudioContext;
window.webkitAudioContext = MockAudioContext;
