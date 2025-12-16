import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
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
} from '../controllers/session.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Session management
router.post('/create', createSession);
router.get('/active', getActiveSessions);
router.get('/:code', getSession);
router.post('/:code/join', joinSession);
router.post('/:code/leave', leaveSession);
router.patch('/:code/settings', updateSessionSettings);
router.delete('/:code', endSession);

// Chat
router.get('/:code/chat', getChatMessages);
router.post('/:code/chat', sendChatMessage);

// Queue
router.post('/:code/queue/add', addToQueue);

export default router;
