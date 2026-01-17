import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import cacheService from '../services/cacheService.js';

/**
 * Distributed WebSocket Service with Redis Adapter
 * Enables horizontal scaling across multiple server instances
 * Implements presence tracking and real-time synchronization
 */

let io;

/**
 * Initialize Socket.IO with Redis adapter for distributed architecture
 * @param {Object} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Setup Redis adapter for horizontal scaling
  if (cacheService.isConnected) {
    const pubClient = cacheService.getClient();
    const subClient = pubClient.duplicate();

    await subClient.connect();

    io.adapter(createAdapter(pubClient, subClient));
    console.log('✅ Socket.IO Redis adapter initialized - Horizontal scaling enabled');
  } else {
    console.warn('⚠️  Redis not available - Socket.IO running in single-server mode');
  }

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        issuer: 'spotichat-auth',
        audience: 'spotichat-users'
      });

      socket.userId = decoded.sub;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.userEmail})`);

    // Track user online status in Redis
    trackUserOnline(socket.userId, socket.id);

    // Join session room
    socket.on('session:join', async (sessionCode) => {
      try {
        // Dynamic import to avoid circular dependencies
        const { default: Session } = await import('../models/session.model.js');

        const session = await Session.findOne({ sessionCode, isActive: true })
          .populate('hostId', 'email avatar displayName')
          .populate('participants.userId', 'email avatar displayName')
          .populate('currentSong')
          .populate('queue');

        if (!session) {
          socket.emit('error', { message: 'Session not found or inactive' });
          return;
        }

        // Check if session is full
        const maxParticipants = session.maxParticipants || 10;
        if (session.participants.length >= maxParticipants) {
          socket.emit('error', { message: 'Session is full' });
          return;
        }

        // Join socket room
        socket.join(sessionCode);
        socket.currentSession = sessionCode;

        // Update participant online status
        const participant = session.participants.find(
          p => p.userId._id.toString() === socket.userId
        );

        if (participant) {
          participant.isOnline = true;
          participant.lastSeen = new Date();
          await session.save();
        }

        // Track session membership in Redis
        await trackSessionMembership(socket.userId, sessionCode);

        // Notify others
        socket.to(sessionCode).emit('user:joined', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          timestamp: new Date()
        });

        // Send current session state
        socket.emit('session:state', session);

        // Broadcast updated participant count
        const participantCount = await io.in(sessionCode).allSockets();
        io.to(sessionCode).emit('session:participants', {
          count: participantCount.size,
          participants: session.participants
        });

        console.log(`User ${socket.userId} joined session ${sessionCode}`);
      } catch (error) {
        console.error('Join session error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Leave session room
    socket.on('session:leave', async () => {
      await handleSessionLeave(socket);
    });

    // Playback control - Play
    socket.on('playback:play', async ({ sessionCode, songId, position = 0 }) => {
      try {
        const { default: Session } = await import('../models/session.model.js');
        const session = await Session.findOne({ sessionCode });

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Check permissions
        const hasPermission = await checkPlaybackPermission(session, socket.userId);
        if (!hasPermission) {
          socket.emit('error', { message: 'No permission to control playback' });
          return;
        }

        session.currentSong = songId;
        session.currentTime = position;
        session.isPlaying = true;
        session.lastUpdate = new Date();
        await session.save();

        await session.populate('currentSong');

        // Broadcast to all in session
        io.to(sessionCode).emit('playback:sync', {
          currentSong: session.currentSong,
          position,
          isPlaying: true,
          lastUpdate: session.lastUpdate,
          controlledBy: socket.userId
        });

        // Cache current playback state
        await cachePlaybackState(sessionCode, {
          songId,
          position,
          isPlaying: true,
          lastUpdate: session.lastUpdate
        });

        console.log(`Playback started in session ${sessionCode} by ${socket.userId}`);
      } catch (error) {
        console.error('Play error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Playback control - Pause
    socket.on('playback:pause', async ({ sessionCode, position }) => {
      try {
        const { default: Session } = await import('../models/session.model.js');
        const session = await Session.findOne({ sessionCode });

        if (!session) return;

        const hasPermission = await checkPlaybackPermission(session, socket.userId);
        if (!hasPermission) {
          socket.emit('error', { message: 'No permission to control playback' });
          return;
        }

        session.currentTime = position;
        session.isPlaying = false;
        session.lastUpdate = new Date();
        await session.save();

        io.to(sessionCode).emit('playback:sync', {
          position,
          isPlaying: false,
          lastUpdate: session.lastUpdate,
          controlledBy: socket.userId
        });

        await cachePlaybackState(sessionCode, {
          position,
          isPlaying: false,
          lastUpdate: session.lastUpdate
        });
      } catch (error) {
        console.error('Pause error:', error);
      }
    });

    // Playback control - Seek
    socket.on('playback:seek', async ({ sessionCode, position }) => {
      try {
        const { default: Session } = await import('../models/session.model.js');
        const session = await Session.findOne({ sessionCode });

        if (!session) return;

        session.currentTime = position;
        session.lastUpdate = new Date();
        await session.save();

        socket.to(sessionCode).emit('playback:sync', {
          position,
          isPlaying: session.isPlaying,
          lastUpdate: session.lastUpdate,
          controlledBy: socket.userId
        });

        await cachePlaybackState(sessionCode, {
          position,
          isPlaying: session.isPlaying,
          lastUpdate: session.lastUpdate
        });
      } catch (error) {
        console.error('Seek error:', error);
      }
    });

    // Playback control - Next
    socket.on('playback:next', async ({ sessionCode }) => {
      try {
        const { default: Session } = await import('../models/session.model.js');
        const session = await Session.findOne({ sessionCode });

        if (!session || session.queue.length === 0) {
          socket.emit('error', { message: 'Queue is empty' });
          return;
        }

        const hasPermission = await checkPlaybackPermission(session, socket.userId);
        if (!hasPermission) {
          socket.emit('error', { message: 'No permission to control playback' });
          return;
        }

        // Get next song from queue
        const nextSongId = session.queue.shift();
        session.currentSong = nextSongId;
        session.currentTime = 0;
        session.isPlaying = true;
        session.lastUpdate = new Date();
        await session.save();

        await session.populate('currentSong');
        await session.populate('queue');

        io.to(sessionCode).emit('playback:sync', {
          currentSong: session.currentSong,
          position: 0,
          isPlaying: true,
          lastUpdate: session.lastUpdate,
          controlledBy: socket.userId
        });

        io.to(sessionCode).emit('queue:updated', {
          queue: session.queue
        });

        // Invalidate queue cache
        await cacheService.del(`session:${sessionCode}:queue`);
      } catch (error) {
        console.error('Next error:', error);
      }
    });

    // Chat message
    socket.on('chat:message', async ({ sessionCode, message }) => {
      try {
        const { default: Session } = await import('../models/session.model.js');
        const { default: ChatMessage } = await import('../models/chatMessage.model.js');

        const session = await Session.findOne({ sessionCode });

        if (!session) return;

        const chatMessage = await ChatMessage.create({
          sessionId: session._id,
          userId: socket.userId,
          message,
          type: 'text'
        });

        await chatMessage.populate('userId', 'email avatar displayName');

        io.to(sessionCode).emit('chat:message', chatMessage);

        // Cache recent messages
        await cacheRecentMessage(sessionCode, chatMessage);
      } catch (error) {
        console.error('Chat error:', error);
      }
    });

    // Typing indicator
    socket.on('chat:typing', ({ sessionCode, isTyping }) => {
      socket.to(sessionCode).emit('chat:typing', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        isTyping
      });
    });

    // Queue add
    socket.on('queue:add', async ({ sessionCode, songId }) => {
      try {
        const { default: Session } = await import('../models/session.model.js');
        const session = await Session.findOne({ sessionCode });

        if (!session) return;

        const participant = session.participants.find(
          p => p.userId.toString() === socket.userId
        );

        if (!participant || !participant.permissions.canAddToQueue) {
          socket.emit('error', { message: 'No permission to add to queue' });
          return;
        }

        session.queue.push(songId);
        session.lastUpdate = new Date();
        await session.save();

        await session.populate('queue');

        io.to(sessionCode).emit('queue:updated', {
          queue: session.queue,
          addedBy: socket.userId
        });

        // Invalidate queue cache
        await cacheService.del(`session:${sessionCode}:queue`);
      } catch (error) {
        console.error('Queue add error:', error);
      }
    });

    // Reaction
    socket.on('reaction:add', async ({ sessionCode, emoji }) => {
      socket.to(sessionCode).emit('reaction:added', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        emoji,
        timestamp: new Date()
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId}`);

      // Remove from online tracking
      await trackUserOffline(socket.userId, socket.id);

      if (socket.currentSession) {
        await handleSessionLeave(socket);
      }
    });
  });

  console.log('✅ Socket.IO initialized with distributed support');
  return io;
};

/**
 * Helper Functions
 */

// Check if user has playback control permission
async function checkPlaybackPermission(session, userId) {
  const participant = session.participants.find(
    p => p.userId.toString() === userId
  );
  return participant && participant.permissions.canControl;
}

// Track user online status in Redis
async function trackUserOnline(userId, socketId) {
  const key = `presence:${userId}`;
  await cacheService.set(key, {
    socketId,
    status: 'online',
    lastSeen: new Date()
  }, 3600); // 1 hour TTL

  // Add to global online users set
  await cacheService.getClient()?.sadd('presence:online', userId);
}

// Track user offline status
async function trackUserOffline(userId, socketId) {
  const key = `presence:${userId}`;
  await cacheService.del(key);

  // Remove from global online users set
  await cacheService.getClient()?.srem('presence:online', userId);
}

// Track session membership
async function trackSessionMembership(userId, sessionCode) {
  const key = `session:${sessionCode}:members`;
  await cacheService.getClient()?.sadd(key, userId);
  await cacheService.expire(key, 86400); // 24 hours
}

// Cache playback state
async function cachePlaybackState(sessionCode, state) {
  const key = `session:${sessionCode}:playback`;
  await cacheService.set(key, state, 300); // 5 minutes TTL
}

// Cache recent chat messages
async function cacheRecentMessage(sessionCode, message) {
  const key = `session:${sessionCode}:messages`;
  const client = cacheService.getClient();

  if (client) {
    await client.lpush(key, JSON.stringify(message));
    await client.ltrim(key, 0, 49); // Keep last 50 messages
    await client.expire(key, 3600); // 1 hour
  }
}

// Handle session leave
async function handleSessionLeave(socket) {
  if (!socket.currentSession) return;

  const sessionCode = socket.currentSession;

  try {
    const { default: Session } = await import('../models/session.model.js');
    const session = await Session.findOne({ sessionCode });

    if (session) {
      const participant = session.participants.find(
        p => p.userId.toString() === socket.userId
      );

      if (participant) {
        participant.isOnline = false;
        participant.lastSeen = new Date();
        await session.save();
      }

      socket.to(sessionCode).emit('user:left', {
        userId: socket.userId,
        timestamp: new Date()
      });

      // Update participant count
      const participantCount = await io.in(sessionCode).allSockets();
      io.to(sessionCode).emit('session:participants', {
        count: participantCount.size - 1 // Exclude the leaving user
      });
    }

    socket.leave(sessionCode);
    socket.currentSession = null;

    // Remove from session members in Redis
    await cacheService.getClient()?.srem(`session:${sessionCode}:members`, socket.userId);
  } catch (error) {
    console.error('Leave session error:', error);
  }
}

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Get online users count
 * @returns {Promise<number>}
 */
export const getOnlineUsersCount = async () => {
  const client = cacheService.getClient();
  if (!client) return 0;

  return await client.scard('presence:online');
};

/**
 * Get user online status
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export const getUserPresence = async (userId) => {
  return await cacheService.get(`presence:${userId}`);
};

/**
 * Get session members
 * @param {string} sessionCode
 * @returns {Promise<string[]>}
 */
export const getSessionMembers = async (sessionCode) => {
  const client = cacheService.getClient();
  if (!client) return [];

  return await client.smembers(`session:${sessionCode}:members`);
};
