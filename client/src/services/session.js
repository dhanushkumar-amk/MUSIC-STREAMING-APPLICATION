import api from './api';

// Create new session
export const createSession = async (data) => {
  const response = await api.post('/sessions', data);
  return response.data;
};

// Get session by code
export const getSession = async (code) => {
  const response = await api.get(`/sessions/${code}`);
  return response.data;
};

// Join session
export const joinSession = async (code) => {
  const response = await api.post(`/sessions/${code}/join`);
  return response.data;
};

// Leave session
export const leaveSession = async (code) => {
  const response = await api.post(`/sessions/${code}/leave`);
  return response.data;
};

// Update session settings
export const updateSessionSettings = async (code, settings) => {
  const response = await api.put(`/sessions/${code}/settings`, settings);
  return response.data;
};

// End session
export const endSession = async (code) => {
  const response = await api.delete(`/sessions/${code}`);
  return response.data;
};

// Get chat messages
export const getChatMessages = async (code, limit = 50) => {
  const response = await api.get(`/sessions/${code}/messages`, {
    params: { limit }
  });
  return response.data;
};

// Send chat message
export const sendChatMessage = async (code, message) => {
  const response = await api.post(`/sessions/${code}/messages`, { message });
  return response.data;
};

// Add song to queue
export const addToQueue = async (code, songId) => {
  const response = await api.post(`/sessions/${code}/queue`, { songId });
  return response.data;
};

// Get active public sessions
export const getActiveSessions = async () => {
  const response = await api.get('/sessions/active');
  return response.data;
};

const sessionService = {
  createSession,
  getSession,
  joinSession,
  leaveSession,
  updateSessionSettings,
  endSession,
  getChatMessages,
  sendChatMessage,
  addToQueue,
  getActiveSessions
};

export default sessionService;
