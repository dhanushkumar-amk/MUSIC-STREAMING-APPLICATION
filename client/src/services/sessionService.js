import api from './api';

const sessionService = {
  // Create new session
  createSession: async (name, privacy = 'private', settings = {}) => {
    const response = await api.post('/session/create', {
      name,
      privacy,
      settings
    });
    return response.data;
  },

  // Get session details
  getSession: async (sessionCode) => {
    const response = await api.get(`/session/${sessionCode}`);
    return response.data;
  },

  // Join session
  joinSession: async (sessionCode) => {
    const response = await api.post(`/session/${sessionCode}/join`);
    return response.data;
  },

  // Leave session
  leaveSession: async (sessionCode) => {
    const response = await api.post(`/session/${sessionCode}/leave`);
    return response.data;
  },

  // Update session settings
  updateSettings: async (sessionCode, settings) => {
    const response = await api.patch(`/session/${sessionCode}/settings`, settings);
    return response.data;
  },

  // End session
  endSession: async (sessionCode) => {
    const response = await api.delete(`/session/${sessionCode}`);
    return response.data;
  },

  // Get chat messages
  getChatMessages: async (sessionCode, limit = 50) => {
    const response = await api.get(`/session/${sessionCode}/chat`, {
      params: { limit }
    });
    return response.data;
  },

  // Send chat message
  sendMessage: async (sessionCode, message, type = 'text', songContext = null) => {
    const response = await api.post(`/session/${sessionCode}/chat`, {
      message,
      type,
      songContext
    });
    return response.data;
  },

  // Add to queue
  addToQueue: async (sessionCode, songId) => {
    const response = await api.post(`/session/${sessionCode}/queue/add`, {
      songId
    });
    return response.data;
  },

  // Get active sessions
  getActiveSessions: async () => {
    const response = await api.get('/session/active');
    return response.data;
  }
};

export default sessionService;
