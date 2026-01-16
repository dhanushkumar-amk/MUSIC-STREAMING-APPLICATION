import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { sessionSchemas } from '../validators/feature.validator.js';

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
router.post('/create', validate(sessionSchemas.createSession), createSession);
router.get('/active', getActiveSessions);
router.get('/:code', validate(sessionSchemas.getSession), getSession);
router.post('/:code/join', validate(sessionSchemas.joinSession), joinSession);
router.post('/:code/leave', validate(sessionSchemas.leaveSession), leaveSession);
router.patch('/:code/settings', validate(sessionSchemas.updateSessionSettings), updateSessionSettings);
router.delete('/:code', validate(sessionSchemas.endSession), endSession);

// Chat
router.get('/:code/chat', validate(sessionSchemas.getChatMessages), getChatMessages);
router.post('/:code/chat', validate(sessionSchemas.sendChatMessage), sendChatMessage);

// Queue
router.post('/:code/queue/add', validate(sessionSchemas.addToSessionQueue), addToQueue);

export default router;
