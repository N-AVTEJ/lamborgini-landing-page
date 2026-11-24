import '@testing-library/jest-dom';

// Polyfill AudioContext for JSDOM
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
  }
  resume() { return Promise.resolve(); }
  decodeAudioData(_arrayBuffer) {
    return Promise.resolve({
      duration: 4.0,
      sampleRate: 44100,
      numberOfChannels: 2,
      length: 176400
    });
  }
  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
      onended: null
    };
  }
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

// Polyfill HTMLMediaElement methods for JSDOM
if (typeof window !== 'undefined' && typeof window.HTMLMediaElement !== 'undefined') {
  window.HTMLMediaElement.prototype.play = function () {
    return Promise.resolve();
  };
  window.HTMLMediaElement.prototype.pause = function () {};
  window.HTMLMediaElement.prototype.load = function () {};
}

// Polyfill window.matchMedia for JSDOM
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    };
  };
}

// Polyfill window.IntersectionObserver for JSDOM
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      MockIntersectionObserver.instances.push(this);
    }
    observe(target) {
      this.target = target;
    }
    unobserve() {}
    disconnect() {}
    simulate(isIntersecting = true) {
      this.callback([{ isIntersecting, target: this.target }]);
    }
  }
  MockIntersectionObserver.instances = [];
  window.IntersectionObserver = MockIntersectionObserver;
}
