import cacheService from './cacheService.js';

/**
 * Presence System Service
 * Tracks user online/offline status and "Now Playing" activity
 * Powers "Friends Are Listening To" feature
 */
class PresenceService {
  constructor() {
    this.PRESENCE_TTL = 300; // 5 minutes
    this.ACTIVITY_TTL = 3600; // 1 hour
  }

  /**
   * Set user as online
   * @param {string} userId - User ID
   * @param {Object} metadata - Additional metadata (socketId, device, etc.)
   */
  async setOnline(userId, metadata = {}) {
    const key = `presence:user:${userId}`;
    const data = {
      status: 'online',
      lastSeen: new Date().toISOString(),
      ...metadata
    };

    await cacheService.set(key, data, this.PRESENCE_TTL);

    // Add to global online users set
    const client = cacheService.getClient();
    if (client) {
      await client.sadd('presence:online:users', userId);
    }

    return data;
  }

  /**
   * Set user as offline
   * @param {string} userId - User ID
   */
  async setOffline(userId) {
    const key = `presence:user:${userId}`;
    const data = {
      status: 'offline',
      lastSeen: new Date().toISOString()
    };

    await cacheService.set(key, data, this.PRESENCE_TTL);

    // Remove from global online users set
    const client = cacheService.getClient();
    if (client) {
      await client.srem('presence:online:users', userId);
    }

    // Clear current activity
    await this.clearActivity(userId);

    return data;
  }

  /**
   * Get user presence status
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getPresence(userId) {
    const key = `presence:user:${userId}`;
    return await cacheService.get(key);
  }

  /**
   * Get multiple users' presence status
   * @param {string[]} userIds - Array of user IDs
   * @returns {Promise<Object>} Map of userId -> presence
   */
  async getBulkPresence(userIds) {
    const presences = {};

    for (const userId of userIds) {
      const presence = await this.getPresence(userId);
      presences[userId] = presence || { status: 'offline' };
    }

    return presences;
  }

  /**
   * Update user's current activity (now playing)
   * @param {string} userId - User ID
   * @param {Object} activity - Activity data (songId, songTitle, artist, etc.)
   */
  async updateActivity(userId, activity) {
    const key = `presence:activity:${userId}`;
    const data = {
      ...activity,
      timestamp: new Date().toISOString(),
      type: activity.type || 'listening' // listening, streaming, idle
    };

    await cacheService.set(key, data, this.ACTIVITY_TTL);

    // Also update presence to keep user online
    await this.setOnline(userId, { currentActivity: activity.type });

    return data;
  }

  /**
   * Get user's current activity
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getActivity(userId) {
    const key = `presence:activity:${userId}`;
    return await cacheService.get(key);
  }

  /**
   * Clear user's current activity
   * @param {string} userId - User ID
   */
  async clearActivity(userId) {
    const key = `presence:activity:${userId}`;
    await cacheService.del(key);
  }

  /**
   * Get all online users count
   * @returns {Promise<number>}
   */
  async getOnlineCount() {
    const client = cacheService.getClient();
    if (!client) return 0;

    return await client.scard('presence:online:users');
  }

  /**
   * Get all online users
   * @returns {Promise<string[]>}
   */
  async getOnlineUsers() {
    const client = cacheService.getClient();
    if (!client) return [];

    return await client.smembers('presence:online:users');
  }

  /**
   * Get friends' activities (for "Friends Are Listening To" feed)
   * @param {string} userId - Current user ID
   * @param {string[]} friendIds - Array of friend user IDs
   * @returns {Promise<Array>}
   */
  async getFriendsActivities(userId, friendIds) {
    const activities = [];

    for (const friendId of friendIds) {
      const presence = await this.getPresence(friendId);
      const activity = await this.getActivity(friendId);

      if (presence && presence.status === 'online' && activity) {
        activities.push({
          userId: friendId,
          presence,
          activity
        });
      }
    }

    // Sort by most recent activity
    activities.sort((a, b) =>
      new Date(b.activity.timestamp) - new Date(a.activity.timestamp)
    );

    return activities;
  }

  /**
   * Track user listening session
   * @param {string} userId - User ID
   * @param {Object} sessionData - Session data
   */
  async trackListeningSession(userId, sessionData) {
    const key = `presence:session:${userId}`;
    const data = {
      ...sessionData,
      startTime: new Date().toISOString()
    };

    await cacheService.set(key, data, this.ACTIVITY_TTL);
    return data;
  }

  /**
   * Get user's listening session
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getListeningSession(userId) {
    const key = `presence:session:${userId}`;
    return await cacheService.get(key);
  }

  /**
   * End user's listening session
   * @param {string} userId - User ID
   */
  async endListeningSession(userId) {
    const key = `presence:session:${userId}`;
    await cacheService.del(key);
  }

  /**
   * Heartbeat - Keep user online
   * Should be called periodically from client
   * @param {string} userId - User ID
   */
  async heartbeat(userId) {
    const presence = await this.getPresence(userId);

    if (presence) {
      await this.setOnline(userId, presence);
    }

    return { success: true, timestamp: new Date().toISOString() };
  }

  /**
   * Get trending songs (most listened to right now)
   * @param {number} limit - Number of results
   * @returns {Promise<Array>}
   */
  async getTrendingNow(limit = 10) {
    const client = cacheService.getClient();
    if (!client) return [];

    const onlineUsers = await this.getOnlineUsers();
    const songCounts = {};

    // Count how many users are listening to each song
    for (const userId of onlineUsers) {
      const activity = await this.getActivity(userId);

      if (activity && activity.songId && activity.type === 'listening') {
        songCounts[activity.songId] = (songCounts[activity.songId] || 0) + 1;
      }
    }

    // Sort by count and return top songs
    const trending = Object.entries(songCounts)
      .map(([songId, count]) => ({ songId, listeners: count }))
      .sort((a, b) => b.listeners - a.listeners)
      .slice(0, limit);

    return trending;
  }

  /**
   * Get users listening to a specific song
   * @param {string} songId - Song ID
   * @returns {Promise<string[]>}
   */
  async getListenersForSong(songId) {
    const onlineUsers = await this.getOnlineUsers();
    const listeners = [];

    for (const userId of onlineUsers) {
      const activity = await this.getActivity(userId);

      if (activity && activity.songId === songId && activity.type === 'listening') {
        listeners.push(userId);
      }
    }

    return listeners;
  }

  /**
   * Set user status (online, away, busy, offline)
   * @param {string} userId - User ID
   * @param {string} status - Status ('online', 'away', 'busy', 'offline')
   * @param {string} customMessage - Optional custom status message
   */
  async setStatus(userId, status, customMessage = null) {
    const key = `presence:user:${userId}`;
    const data = {
      status,
      customMessage,
      lastSeen: new Date().toISOString()
    };

    await cacheService.set(key, data, this.PRESENCE_TTL);

    // Update online users set
    const client = cacheService.getClient();
    if (client) {
      if (status === 'online' || status === 'away' || status === 'busy') {
        await client.sadd('presence:online:users', userId);
      } else {
        await client.srem('presence:online:users', userId);
      }
    }

    return data;
  }

  /**
   * Clean up stale presence data
   * Should be run periodically as a cron job
   */
  async cleanup() {
    const client = cacheService.getClient();
    if (!client) return;

    const onlineUsers = await this.getOnlineUsers();
    let cleanedCount = 0;

    for (const userId of onlineUsers) {
      const presence = await this.getPresence(userId);

      // If presence data doesn't exist or is stale, remove from online set
      if (!presence) {
        await client.srem('presence:online:users', userId);
        cleanedCount++;
      }
    }

    console.log(`Presence cleanup: Removed ${cleanedCount} stale users`);
    return cleanedCount;
  }
}

// Export singleton instance
export default new PresenceService();
