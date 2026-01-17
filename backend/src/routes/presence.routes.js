import express from 'express';
import presenceService from '../services/presenceService.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.js';

const router = express.Router();

/**
 * Presence API Routes
 * Handles user presence, activity tracking, and social features
 *
 * Note: Authentication middleware should be added in server.js or here
 * For now, assuming req.user is populated by auth middleware
 */

/**
 * @route   POST /api/presence/heartbeat
 * @desc    Send heartbeat to keep user online
 * @access  Private
 */
router.post('/heartbeat', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId; // Fallback for testing
  const result = await presenceService.heartbeat(userId);

  res.json({
    success: true,
    data: result
  });
}));

/**
 * @route   POST /api/presence/status
 * @desc    Update user status
 * @access  Private
 */
router.post('/status', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const { status, customMessage } = req.body;

  const result = await presenceService.setStatus(
    userId,
    status,
    customMessage
  );

  res.json({
    success: true,
    data: result
  });
}));

/**
 * @route   GET /api/presence/me
 * @desc    Get current user's presence
 * @access  Private
 */
router.get('/me', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  const presence = await presenceService.getPresence(userId);

  res.json({
    success: true,
    data: presence || { status: 'offline' }
  });
}));

/**
 * @route   GET /api/presence/user/:userId
 * @desc    Get specific user's presence
 * @access  Private
 */
router.get('/user/:userId', asyncErrorHandler(async (req, res) => {
  const presence = await presenceService.getPresence(req.params.userId);

  res.json({
    success: true,
    data: presence || { status: 'offline' }
  });
}));

/**
 * @route   POST /api/presence/bulk
 * @desc    Get multiple users' presence
 * @access  Private
 */
router.post('/bulk', asyncErrorHandler(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds)) {
    return res.status(400).json({
      success: false,
      message: 'userIds must be an array'
    });
  }

  const presences = await presenceService.getBulkPresence(userIds);

  res.json({
    success: true,
    data: presences
  });
}));

/**
 * @route   POST /api/presence/activity
 * @desc    Update user's current activity (now playing)
 * @access  Private
 */
router.post('/activity', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const { songId, songTitle, artist, album, coverImage, type } = req.body;

  const activity = await presenceService.updateActivity(userId, {
    songId,
    songTitle,
    artist,
    album,
    coverImage,
    type: type || 'listening'
  });

  res.json({
    success: true,
    data: activity
  });
}));

/**
 * @route   GET /api/presence/activity/me
 * @desc    Get current user's activity
 * @access  Private
 */
router.get('/activity/me', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  const activity = await presenceService.getActivity(userId);

  res.json({
    success: true,
    data: activity
  });
}));

/**
 * @route   DELETE /api/presence/activity
 * @desc    Clear current user's activity
 * @access  Private
 */
router.delete('/activity', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  await presenceService.clearActivity(userId);

  res.json({
    success: true,
    message: 'Activity cleared'
  });
}));

/**
 * @route   GET /api/presence/friends/activities
 * @desc    Get friends' current activities ("Friends Are Listening To")
 * @access  Private
 */
router.get('/friends/activities', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  // TODO: Get user's friends from database
  // For now, accepting friendIds from query params
  const friendIds = req.query.friendIds ? req.query.friendIds.split(',') : [];

  const activities = await presenceService.getFriendsActivities(
    userId,
    friendIds
  );

  res.json({
    success: true,
    data: activities
  });
}));

/**
 * @route   GET /api/presence/online/count
 * @desc    Get total online users count
 * @access  Private
 */
router.get('/online/count', asyncErrorHandler(async (req, res) => {
  const count = await presenceService.getOnlineCount();

  res.json({
    success: true,
    data: { count }
  });
}));

/**
 * @route   GET /api/presence/online/users
 * @desc    Get all online users
 * @access  Private (Admin only)
 */
router.get('/online/users', asyncErrorHandler(async (req, res) => {
  const users = await presenceService.getOnlineUsers();

  res.json({
    success: true,
    data: users
  });
}));

/**
 * @route   GET /api/presence/trending
 * @desc    Get trending songs (most listened to right now)
 * @access  Private
 */
router.get('/trending', asyncErrorHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const trending = await presenceService.getTrendingNow(limit);

  res.json({
    success: true,
    data: trending
  });
}));

/**
 * @route   GET /api/presence/song/:songId/listeners
 * @desc    Get users currently listening to a specific song
 * @access  Private
 */
router.get('/song/:songId/listeners', asyncErrorHandler(async (req, res) => {
  const listeners = await presenceService.getListenersForSong(req.params.songId);

  res.json({
    success: true,
    data: {
      songId: req.params.songId,
      listeners,
      count: listeners.length
    }
  });
}));

/**
 * @route   POST /api/presence/session/start
 * @desc    Start a listening session
 * @access  Private
 */
router.post('/session/start', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const { sessionType, metadata } = req.body;

  const session = await presenceService.trackListeningSession(userId, {
    sessionType: sessionType || 'solo',
    ...metadata
  });

  res.json({
    success: true,
    data: session
  });
}));

/**
 * @route   GET /api/presence/session/current
 * @desc    Get current listening session
 * @access  Private
 */
router.get('/session/current', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  const session = await presenceService.getListeningSession(userId);

  res.json({
    success: true,
    data: session
  });
}));

/**
 * @route   POST /api/presence/session/end
 * @desc    End current listening session
 * @access  Private
 */
router.post('/session/end', asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  await presenceService.endListeningSession(userId);

  res.json({
    success: true,
    message: 'Session ended'
  });
}));

export default router;
