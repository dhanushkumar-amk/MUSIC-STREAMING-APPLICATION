import api from './api';

// ==================== SONG SERVICES ====================
export const songService = {
  getAll: async () => {
    const response = await api.get('/song/list');
    return response.data;
  },

  add: async (formData) => {
    const response = await api.post('/song/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  remove: async (id) => {
    const response = await api.post('/song/remove', { id });
    return response.data;
  },
};

// ==================== ALBUM SERVICES ====================
export const albumService = {
  getAll: async () => {
    const response = await api.get('/album/list');
    return response.data;
  },

  add: async (formData) => {
    const response = await api.post('/album/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  remove: async (id) => {
    const response = await api.post('/album/remove', { id });
    return response.data;
  },
};

// ==================== PLAYLIST SERVICES ====================
export const playlistService = {
  // Create playlist with description and privacy
  create: async (name, desc = "", isPublic = false) => {
    const response = await api.post('/playlist/create', { name, desc, isPublic });
    return response.data;
  },

  // Get all user playlists
  list: async () => {
    const response = await api.get('/playlist/list');
    return response.data;
  },

  // Get single playlist
  get: async (playlistId) => {
    const response = await api.get(`/playlist/${playlistId}`);
    return response.data;
  },

  // Update playlist
  update: async (playlistId, updates) => {
    const response = await api.put('/playlist/update', { playlistId, ...updates });
    return response.data;
  },

  // Rename playlist (legacy)
  rename: async (playlistId, newName) => {
    const response = await api.post('/playlist/rename', { playlistId, newName });
    return response.data;
  },

  // Delete playlist
  delete: async (playlistId) => {
    const response = await api.delete('/playlist/delete', { data: { playlistId } });
    return response.data;
  },

  // Add song to playlist
  addSong: async (playlistId, songId) => {
    const response = await api.post('/playlist/add-song', { playlistId, songId });
    return response.data;
  },

  // Remove song from playlist
  removeSong: async (playlistId, songId) => {
    const response = await api.post('/playlist/remove-song', { playlistId, songId });
    return response.data;
  },

  // Reorder playlist songs
  reorder: async (playlistId, songIds) => {
    const response = await api.post('/playlist/reorder', { playlistId, songIds });
    return response.data;
  },

  // Toggle collaborative
  toggleCollaborative: async (playlistId) => {
    const response = await api.post('/playlist/toggle-collaborative', { playlistId });
    return response.data;
  },

  // Add collaborator
  addCollaborator: async (playlistId, collaboratorId) => {
    const response = await api.post('/playlist/add-collaborator', { playlistId, collaboratorId });
    return response.data;
  },

  // Remove collaborator
  removeCollaborator: async (playlistId, collaboratorId) => {
    const response = await api.post('/playlist/remove-collaborator', { playlistId, collaboratorId });
    return response.data;
  },

  // Playback controls
  startPlayback: async (playlistId) => {
    const response = await api.post('/playlist/start-playback', { playlistId });
    return response.data;
  },

  toggleShuffle: async (playlistId) => {
    const response = await api.post('/playlist/toggle-shuffle', { playlistId });
    return response.data;
  },

  updateLoop: async (playlistId, loopMode) => {
    const response = await api.post('/playlist/update-loop', { playlistId, loopMode });
    return response.data;
  },
};

// ==================== LIBRARY SERVICES ====================
export const libraryService = {
  // Songs
  likeSong: async (songId) => {
    const response = await api.post('/library/song/like', { songId });
    return response.data;
  },

  unlikeSong: async (songId) => {
    const response = await api.post('/library/song/unlike', { songId });
    return response.data;
  },

  getLikedSongs: async () => {
    const response = await api.get('/library/song/list');
    return response.data;
  },

  // Albums
  likeAlbum: async (albumId) => {
    const response = await api.post('/library/album/like', { albumId });
    return response.data;
  },

  unlikeAlbum: async (albumId) => {
    const response = await api.post('/library/album/unlike', { albumId });
    return response.data;
  },

  getLikedAlbums: async () => {
    const response = await api.get('/library/album/list');
    return response.data;
  },
};

// ==================== QUEUE SERVICES ====================
export const queueService = {
  start: async (songIds, contextType, contextId) => {
    const response = await api.post('/queue/start', { songIds, contextType, contextId });
    return response.data;
  },

  getState: async () => {
    const response = await api.get('/queue/state');
    return response.data;
  },

  next: async () => {
    const response = await api.get('/queue/next');
    return response.data;
  },

  previous: async () => {
    const response = await api.get('/queue/previous');
    return response.data;
  },

  toggleShuffle: async () => {
    const response = await api.post('/queue/shuffle');
    return response.data;
  },

  updateLoop: async (loopMode) => {
    const response = await api.post('/queue/loop', { loopMode });
    return response.data;
  },

  add: async (songId) => {
    const response = await api.post('/queue/add', { songId });
    return response.data;
  },

  playNext: async (songId) => {
    const response = await api.post('/queue/play-next', { songId });
    return response.data;
  },

  remove: async (songId) => {
    const response = await api.post('/queue/remove', { songId });
    return response.data;
  },

  clear: async () => {
    const response = await api.delete('/queue/clear');
    return response.data;
  },
};

// ==================== SEARCH SERVICES ====================
export const searchService = {
  // Global search
  search: async (query) => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Autocomplete search
  autocomplete: async (query) => {
    const response = await api.get(`/search/autocomplete?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Save recent search
  saveRecent: async (query, type = 'query', resultId = null) => {
    const response = await api.post('/search/recent', { query, type, resultId });
    return response.data;
  },

  // Get recent searches
  getRecent: async () => {
    const response = await api.get('/search/recent');
    return response.data;
  },

  // Clear all recent searches
  clearRecent: async () => {
    const response = await api.delete('/search/recent');
    return response.data;
  },

  // Delete single recent search
  deleteRecent: async (searchId) => {
    const response = await api.delete(`/search/recent/${searchId}`);
    return response.data;
  },
};


// ==================== RECENTLY PLAYED SERVICES ====================
export const recentlyPlayedService = {
  trackStart: async (songId, contextType, contextId) => {
    const response = await api.post('/recently-played/start', { songId, contextType, contextId });
    return response.data;
  },

  trackEnd: async (entryId, playDuration, skipped) => {
    const response = await api.post('/recently-played/end', { entryId, playDuration, skipped });
    return response.data;
  },

  getList: async () => {
    const response = await api.get('/recently-played/list');
    return response.data;
  },
};

// ==================== PLAY STATS SERVICES ====================
export const playStatsService = {
  incrementPlay: async (songId) => {
    const response = await api.post('/plays/play', { songId });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/plays/stats');
    return response.data;
  },
};

// ==================== RECOMMENDATION SERVICES ====================
export const recommendationService = {
  getHomeFeed: async () => {
    const response = await api.get('/recommendation/home');
    return response.data;
  },
};

// ==================== USER SERVICES ====================
export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },

  // Update profile (name & bio)
  updateProfile: async (data) => {
    const response = await api.patch('/user/me/update', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.patch('/user/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await api.delete('/user/me/avatar');
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.patch('/user/me/change-password', {
      oldPassword,
      newPassword
    });
    return response.data;
  },

  // Get account stats
  getAccountStats: async () => {
    const response = await api.get('/user/me/stats');
    return response.data;
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await api.delete('/user/me/account', {
      data: { password }
    });
    return response.data;
  },
};
