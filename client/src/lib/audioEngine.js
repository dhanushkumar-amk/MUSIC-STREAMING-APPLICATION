// Advanced Audio Engine with Equalizer, Crossfade, and more
export class AdvancedAudioEngine {
  constructor() {
    this.audioContext = null;
    this.currentSource = null;
    this.nextSource = null;
    this.gainNode = null;
    this.nextGainNode = null;
    this.analyser = null;
    this.eqNodes = [];
    this.compressor = null;

    // Settings
    this.settings = {
      crossfadeDuration: 0,
      gaplessPlayback: true,
      normalizeVolume: false,
      playbackSpeed: 1.0,
      equalizerEnabled: false,
      equalizerBands: {}
    };

    // EQ Frequencies (10-band)
    this.eqFrequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create analyser for visualizations
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      // Create compressor for volume normalization
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Create 10-band equalizer
      this.createEqualizer();

      // Create gain node
      this.gainNode = this.audioContext.createGain();

      console.log('✅ Advanced Audio Engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  createEqualizer() {
    // Clear existing EQ nodes
    this.eqNodes = [];

    // Create 10 band-pass filters
    this.eqFrequencies.forEach((freq, index) => {
      const filter = this.audioContext.createBiquadFilter();

      if (index === 0) {
        // First band - lowshelf
        filter.type = 'lowshelf';
      } else if (index === this.eqFrequencies.length - 1) {
        // Last band - highshelf
        filter.type = 'highshelf';
      } else {
        // Middle bands - peaking
        filter.type = 'peaking';
        filter.Q.value = 1.0;
      }

      filter.frequency.value = freq;
      filter.gain.value = 0;

      this.eqNodes.push(filter);
    });
  }

  connectNodes(sourceNode) {
    let currentNode = sourceNode;

    // Connect through equalizer if enabled
    if (this.settings.equalizerEnabled) {
      this.eqNodes.forEach(filter => {
        currentNode.connect(filter);
        currentNode = filter;
      });
    }

    // Connect through compressor if normalize is enabled
    if (this.settings.normalizeVolume) {
      currentNode.connect(this.compressor);
      currentNode = this.compressor;
    }

    // Connect to analyser
    currentNode.connect(this.analyser);

    // Connect to gain node
    currentNode.connect(this.gainNode);

    // Connect to destination
    this.gainNode.connect(this.audioContext.destination);
  }

  async loadAudio(url, isNext = false) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      return audioBuffer;
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  async play(audioBuffer, startTime = 0) {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Stop current source if exists
    if (this.currentSource) {
      this.currentSource.stop();
    }

    // Create new source
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = audioBuffer;
    this.currentSource.playbackRate.value = this.settings.playbackSpeed;

    // Connect nodes
    this.connectNodes(this.currentSource);

    // Start playback
    this.currentSource.start(0, startTime);

    return this.currentSource;
  }

  async crossfade(nextAudioBuffer, currentTime, duration) {
    if (!this.settings.crossfadeDuration || this.settings.crossfadeDuration === 0) {
      // No crossfade, just play next
      return this.play(nextAudioBuffer);
    }

    const fadeDuration = this.settings.crossfadeDuration;
    const fadeStartTime = this.audioContext.currentTime;

    // Fade out current track
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, fadeStartTime);
      this.gainNode.gain.linearRampToValueAtTime(0, fadeStartTime + fadeDuration);
    }

    // Create next source
    this.nextSource = this.audioContext.createBufferSource();
    this.nextSource.buffer = nextAudioBuffer;
    this.nextSource.playbackRate.value = this.settings.playbackSpeed;

    // Create gain node for next track
    this.nextGainNode = this.audioContext.createGain();
    this.nextGainNode.gain.setValueAtTime(0, fadeStartTime);
    this.nextGainNode.gain.linearRampToValueAtTime(1, fadeStartTime + fadeDuration);

    // Connect next source
    let currentNode = this.nextSource;

    if (this.settings.equalizerEnabled) {
      this.eqNodes.forEach(filter => {
        currentNode.connect(filter);
        currentNode = filter;
      });
    }

    if (this.settings.normalizeVolume) {
      currentNode.connect(this.compressor);
      currentNode = this.compressor;
    }

    currentNode.connect(this.analyser);
    currentNode.connect(this.nextGainNode);
    this.nextGainNode.connect(this.audioContext.destination);

    // Start next track
    this.nextSource.start(fadeStartTime);

    // After fade, swap sources
    setTimeout(() => {
      if (this.currentSource) {
        this.currentSource.stop();
      }
      this.currentSource = this.nextSource;
      this.gainNode = this.nextGainNode;
      this.nextSource = null;
      this.nextGainNode = null;
    }, fadeDuration * 1000);

    return this.nextSource;
  }

  pause() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  stop() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    if (this.nextSource) {
      this.nextSource.stop();
      this.nextSource = null;
    }
  }

  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
  }

  setPlaybackSpeed(speed) {
    this.settings.playbackSpeed = speed;
    if (this.currentSource) {
      this.currentSource.playbackRate.value = speed;
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };

    // Update EQ if changed
    if (newSettings.equalizerBands) {
      this.updateEqualizer(newSettings.equalizerBands);
    }
  }

  updateEqualizer(bands) {
    const bandKeys = ['band32', 'band64', 'band125', 'band250', 'band500', 'band1k', 'band2k', 'band4k', 'band8k', 'band16k'];

    bandKeys.forEach((key, index) => {
      if (bands[key] !== undefined && this.eqNodes[index]) {
        this.eqNodes[index].gain.value = bands[key];
      }
    });
  }

  toggleEqualizer(enabled) {
    this.settings.equalizerEnabled = enabled;
    // Reconnect audio graph
    if (this.currentSource) {
      // Will be applied on next track
    }
  }

  getAnalyserData() {
    if (!this.analyser) return null;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    return dataArray;
  }

  getCurrentTime() {
    return this.audioContext ? this.audioContext.currentTime : 0;
  }

  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
