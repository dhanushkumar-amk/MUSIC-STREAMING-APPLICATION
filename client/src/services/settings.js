import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return { Authorization: `Bearer ${token}` };
};

export const settingsService = {
  // Get user settings
  getSettings: async () => {
    const response = await axios.get(`${API_URL}/api/settings`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Update all settings
  updateSettings: async (settings) => {
    const response = await axios.put(`${API_URL}/api/settings`, settings, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Audio quality
  updateAudioQuality: async (quality) => {
    const response = await axios.patch(
      `${API_URL}/api/settings/audio-quality`,
      { quality },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Crossfade
  updateCrossfade: async (duration) => {
    const response = await axios.patch(
      `${API_URL}/api/settings/crossfade`,
      { duration },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Gapless playback
  toggleGapless: async (enabled) => {
    const response = await axios.patch(
      `${API_URL}/api/settings/gapless`,
      { enabled },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Normalize volume
  toggleNormalize: async (enabled) => {
    const response = await axios.patch(
      `${API_URL}/api/settings/normalize`,
      { enabled },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Playback speed
  updatePlaybackSpeed: async (speed) => {
    const response = await axios.patch(
      `${API_URL}/api/settings/playback-speed`,
      { speed },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Equalizer
  toggleEqualizer: async (enabled) => {
    const response = await axios.patch(
      `${API_URL}/api/settings/equalizer/toggle`,
      { enabled },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  updateEqualizerPreset: async (preset) => {
    const response = await axios.patch(
      `${API_URL}/api/settings/equalizer/preset`,
      { preset },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  updateEqualizerBands: async (bands) => {
    const response = await axios.patch(
      `${API_URL}/api/settings/equalizer/bands`,
      { bands },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getEqualizerPresets: async () => {
    const response = await axios.get(`${API_URL}/api/settings/equalizer/presets`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

export const lyricsService = {
  // Get lyrics for a song
  getLyrics: async (songId) => {
    const response = await axios.get(`${API_URL}/api/lyrics/${songId}`);
    return response.data;
  },

  // Add/update lyrics (Admin)
  upsertLyrics: async (lyricsData) => {
    const response = await axios.post(`${API_URL}/api/lyrics`, lyricsData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Import LRC format
  importLRC: async (songId, lrcText, language = 'en') => {
    const response = await axios.post(
      `${API_URL}/api/lyrics/import-lrc`,
      { songId, lrcText, language },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Delete lyrics
  deleteLyrics: async (songId) => {
    const response = await axios.delete(`${API_URL}/api/lyrics/${songId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get all songs with lyrics
  getSongsWithLyrics: async () => {
    const response = await axios.get(`${API_URL}/api/lyrics`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};
