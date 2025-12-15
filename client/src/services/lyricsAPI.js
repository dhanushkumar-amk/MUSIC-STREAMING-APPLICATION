import axios from 'axios';

// Free lyrics API - lrclib.net
const LRCLIB_API = 'https://lrclib.net/api';

export const lyricsAPI = {
  // Search for lyrics by track name and artist
  searchLyrics: async (trackName, artistName, albumName = '', duration = 0) => {
    try {
      const params = new URLSearchParams({
        track_name: trackName,
        artist_name: artistName,
      });

      if (albumName) params.append('album_name', albumName);
      if (duration) params.append('duration', Math.floor(duration));

      const response = await axios.get(`${LRCLIB_API}/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search lyrics:', error);
      return [];
    }
  },

  // Get lyrics by ID
  getLyricsById: async (id) => {
    try {
      const response = await axios.get(`${LRCLIB_API}/get/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get lyrics:', error);
      return null;
    }
  },

  // Parse LRC format to synced lyrics array
  parseLRC: (lrcText) => {
    if (!lrcText) return [];

    const lines = lrcText.split('\n');
    const syncedLyrics = [];

    for (const line of lines) {
      // Match [mm:ss.xx] or [mm:ss] format
      const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2}))?\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const centiseconds = match[3] ? parseInt(match[3]) : 0;
        const text = match[4].trim();

        const time = minutes * 60 + seconds + centiseconds / 100;

        if (text) {
          syncedLyrics.push({ time, text });
        }
      }
    }

    return syncedLyrics.sort((a, b) => a.time - b.time);
  },

  // Auto-fetch lyrics for a song
  autoFetchLyrics: async (songName, artistName, albumName = '', duration = 0) => {
    try {
      const results = await lyricsAPI.searchLyrics(songName, artistName, albumName, duration);

      if (results && results.length > 0) {
        const bestMatch = results[0];

        return {
          plainLyrics: bestMatch.plainLyrics || '',
          syncedLyrics: bestMatch.syncedLyrics ? lyricsAPI.parseLRC(bestMatch.syncedLyrics) : [],
          source: 'lrclib',
          language: 'en'
        };
      }

      return null;
    } catch (error) {
      console.error('Auto-fetch lyrics failed:', error);
      return null;
    }
  }
};
