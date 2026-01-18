import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Streaming API Service
 * Handles all HLS streaming related API calls
 */
class StreamingAPI {
  /**
   * Get HLS stream URL for a song
   * @param {string} songId - Song ID
   * @returns {Promise<Object>} Stream data with HLS URL or fallback
   */
  async getHLSStream(songId) {
    try {
      const response = await axios.get(`${API_URL}/api/streaming/hls/${songId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching HLS stream:', error);
      throw error;
    }
  }

  /**
   * Process a song for HLS transcoding
   * @param {string} songId - Song ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Processing status
   */
  async processHLS(songId, token) {
    try {
      const response = await axios.post(
        `${API_URL}/api/streaming/process/${songId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing HLS:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple songs for HLS
   * @param {string[]} songIds - Array of song IDs
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Batch processing status
   */
  async batchProcessHLS(songIds, token) {
    try {
      const response = await axios.post(
        `${API_URL}/api/streaming/batch-process`,
        { songIds },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error batch processing HLS:', error);
      throw error;
    }
  }

  /**
   * Get streaming statistics
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Streaming stats
   */
  async getStreamingStats(token) {
    try {
      const response = await axios.get(`${API_URL}/api/streaming/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming stats:', error);
      throw error;
    }
  }

  /**
   * Check streaming service health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${API_URL}/api/streaming/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking streaming health:', error);
      throw error;
    }
  }

  /**
   * Get stream URL with automatic HLS detection
   * @param {string} songId - Song ID
   * @returns {Promise<Object>} Stream URL and metadata
   */
  async getStreamUrl(songId) {
    try {
      const streamData = await this.getHLSStream(songId);

      return {
        url: streamData.hlsAvailable
          ? streamData.masterPlaylist
          : streamData.fallbackUrl,
        isHLS: streamData.hlsAvailable,
        qualities: streamData.qualities || {},
        fallbackUrl: streamData.fallbackUrl,
        metadata: streamData.metadata
      };
    } catch (error) {
      console.error('Error getting stream URL:', error);
      throw error;
    }
  }
}

export default new StreamingAPI();
