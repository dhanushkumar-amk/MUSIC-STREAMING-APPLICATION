import Hls from 'hls.js';

/**
 * HLS Player Service for adaptive bitrate streaming
 * Handles HLS.js integration with fallback support
 */
class HLSPlayerService {
  constructor() {
    this.hls = null;
    this.currentAudio = null;
    this.isHLSSupported = Hls.isSupported();
  }

  /**
   * Initialize HLS player
   * @param {HTMLAudioElement} audioElement - Audio element to attach
   * @param {string} streamUrl - HLS master playlist URL or fallback URL
   * @param {boolean} isHLS - Whether the URL is HLS format
   */
  async initPlayer(audioElement, streamUrl, isHLS = true) {
    try {
      // Cleanup previous instance
      this.cleanup();

      this.currentAudio = audioElement;

      if (isHLS && this.isHLSSupported) {
        // Use HLS.js for adaptive streaming
        return this.loadHLS(audioElement, streamUrl);
      } else if (isHLS && audioElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari, iOS)
        return this.loadNativeHLS(audioElement, streamUrl);
      } else {
        // Fallback to direct audio streaming
        return this.loadDirect(audioElement, streamUrl);
      }
    } catch (error) {
      console.error('HLS Player initialization error:', error);
      throw error;
    }
  }

  /**
   * Load HLS stream using HLS.js
   */
  loadHLS(audioElement, url) {
    return new Promise((resolve, reject) => {
      this.hls = new Hls({
        // Performance optimizations
        maxBufferLength: 30,           // 30 seconds buffer
        maxMaxBufferLength: 60,        // Max 60 seconds
        maxBufferSize: 60 * 1000 * 1000, // 60 MB
        maxBufferHole: 0.5,            // Max gap to skip

        // Quality settings
        startLevel: -1,                // Auto start level
        autoLevelEnabled: true,        // Enable ABR
        autoLevelCapping: -1,          // No quality cap

        // Network settings
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 3,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 3,

        // Enable worker for better performance
        enableWorker: true,
        enableSoftwareAES: true,

        // Debug (disable in production)
        debug: false
      });

      // Event listeners
      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('HLS manifest loaded, found ' + data.levels.length + ' quality levels');
        resolve({
          type: 'hls',
          levels: data.levels.length,
          qualities: data.levels.map(l => ({
            height: l.height,
            bitrate: l.bitrate,
            name: this.getBitrateLabel(l.bitrate)
          }))
        });
      });

      this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = this.hls.levels[data.level];
        console.log('Quality switched to:', this.getBitrateLabel(level.bitrate));
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              this.hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              this.hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover');
              this.cleanup();
              reject(data);
              break;
          }
        }
      });

      // Load and attach
      this.hls.loadSource(url);
      this.hls.attachMedia(audioElement);
    });
  }

  /**
   * Load HLS natively (Safari, iOS)
   */
  loadNativeHLS(audioElement, url) {
    return new Promise((resolve, reject) => {
      audioElement.src = url;

      audioElement.addEventListener('loadedmetadata', () => {
        resolve({
          type: 'native-hls',
          message: 'Using native HLS support'
        });
      }, { once: true });

      audioElement.addEventListener('error', (e) => {
        reject(e);
      }, { once: true });
    });
  }

  /**
   * Load direct audio stream (fallback)
   */
  loadDirect(audioElement, url) {
    return new Promise((resolve, reject) => {
      audioElement.src = url;

      audioElement.addEventListener('loadedmetadata', () => {
        resolve({
          type: 'direct',
          message: 'Using direct audio streaming'
        });
      }, { once: true });

      audioElement.addEventListener('error', (e) => {
        reject(e);
      }, { once: true });
    });
  }

  /**
   * Get current quality level
   */
  getCurrentQuality() {
    if (this.hls && this.hls.levels.length > 0) {
      const currentLevel = this.hls.currentLevel;
      if (currentLevel >= 0) {
        const level = this.hls.levels[currentLevel];
        return {
          level: currentLevel,
          bitrate: level.bitrate,
          label: this.getBitrateLabel(level.bitrate),
          auto: this.hls.autoLevelEnabled
        };
      }
    }
    return null;
  }

  /**
   * Set quality level manually
   * @param {number} level - Quality level index (-1 for auto)
   */
  setQuality(level) {
    if (this.hls) {
      this.hls.currentLevel = level;
      console.log('Quality set to:', level === -1 ? 'Auto' : level);
    }
  }

  /**
   * Get available quality levels
   */
  getQualityLevels() {
    if (this.hls && this.hls.levels) {
      return this.hls.levels.map((level, index) => ({
        index,
        bitrate: level.bitrate,
        label: this.getBitrateLabel(level.bitrate),
        width: level.width,
        height: level.height
      }));
    }
    return [];
  }

  /**
   * Get bitrate label
   */
  getBitrateLabel(bitrate) {
    const kbps = Math.round(bitrate / 1000);
    if (kbps >= 256) return 'High (320k)';
    if (kbps >= 192) return 'High (256k)';
    if (kbps >= 96) return 'Medium (128k)';
    return 'Low (64k)';
  }

  /**
   * Get playback statistics
   */
  getStats() {
    if (this.hls) {
      return {
        currentLevel: this.hls.currentLevel,
        autoLevelEnabled: this.hls.autoLevelEnabled,
        loadLevel: this.hls.loadLevel,
        nextLoadLevel: this.hls.nextLoadLevel,
        bufferLength: this.hls.media ? this.hls.media.buffered.length : 0
      };
    }
    return null;
  }

  /**
   * Cleanup HLS instance
   */
  cleanup() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.currentAudio = null;
  }

  /**
   * Check if HLS is supported
   */
  static isSupported() {
    return Hls.isSupported();
  }
}

export default new HLSPlayerService();
