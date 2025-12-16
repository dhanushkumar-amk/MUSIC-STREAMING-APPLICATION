import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Session from '../models/session.model.js';
import ChatMessage from '../models/chatMessage.model.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        issuer: 'spotichat-auth',
        audience: 'spotichat-users'
      });

      socket.userId = decoded.sub;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join session room
    socket.on('session:join', async (sessionCode) => {
      try {
        const session = await Session.findOne({ sessionCode, isActive: true })
          .populate('hostId', 'email avatar')
          .populate('participants.userId', 'email avatar')
          .populate('currentSong')
          .populate('queue');

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
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
          await session.save();
        }

        // Notify others
        socket.to(sessionCode).emit('user:joined', {
          userId: socket.userId,
          session
        });

        // Send current session state
        socket.emit('session:state', session);

        console.log(`User ${socket.userId} joined session ${sessionCode}`);
      } catch (error) {
        console.error('Join session error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Leave session room
    socket.on('session:leave', async () => {
      if (socket.currentSession) {
        const sessionCode = socket.currentSession;

        try {
          const session = await Session.findOne({ sessionCode });

          if (session) {
            const participant = session.participants.find(
              p => p.userId.toString() === socket.userId
            );

            if (participant) {
              participant.isOnline = false;
              await session.save();
            }

            socket.to(sessionCode).emit('user:left', {
              userId: socket.userId
            });
          }

          socket.leave(sessionCode);
          socket.currentSession = null;
        } catch (error) {
          console.error('Leave session error:', error);
        }
      }
    });

    // Playback control - Play
    socket.on('playback:play', async ({ sessionCode, songId, position = 0 }) => {
      try {
        const session = await Session.findOne({ sessionCode });

        if (!session) return;

        // Check permissions
        const participant = session.participants.find(
          p => p.userId.toString() === socket.userId
        );

        if (!participant || !participant.permissions.canControl) {
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
          lastUpdate: session.lastUpdate
        });

        console.log(`Playback started in session ${sessionCode}`);
      } catch (error) {
        console.error('Play error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Playback control - Pause
    socket.on('playback:pause', async ({ sessionCode, position }) => {
      try {
        const session = await Session.findOne({ sessionCode });

        if (!session) return;

        const participant = session.participants.find(
          p => p.userId.toString() === socket.userId
        );

        if (!participant || !participant.permissions.canControl) {
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
          lastUpdate: session.lastUpdate
        });
      } catch (error) {
        console.error('Pause error:', error);
      }
    });

    // Playback control - Seek
    socket.on('playback:seek', async ({ sessionCode, position }) => {
      try {
        const session = await Session.findOne({ sessionCode });

        if (!session) return;

        session.currentTime = position;
        session.lastUpdate = new Date();
        await session.save();

        socket.to(sessionCode).emit('playback:sync', {
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
        const session = await Session.findOne({ sessionCode });

        if (!session || session.queue.length === 0) return;

        const participant = session.participants.find(
          p => p.userId.toString() === socket.userId
        );

        if (!participant || !participant.permissions.canControl) {
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
          lastUpdate: session.lastUpdate
        });

        io.to(sessionCode).emit('queue:updated', {
          queue: session.queue
        });
      } catch (error) {
        console.error('Next error:', error);
      }
    });

    // Chat message
    socket.on('chat:message', async ({ sessionCode, message }) => {
      try {
        const session = await Session.findOne({ sessionCode });

        if (!session) return;

        const chatMessage = await ChatMessage.create({
          sessionId: session._id,
          userId: socket.userId,
          message,
          type: 'text'
        });

        await chatMessage.populate('userId', 'email avatar');

        io.to(sessionCode).emit('chat:message', chatMessage);
      } catch (error) {
        console.error('Chat error:', error);
      }
    });

    // Typing indicator
    socket.on('chat:typing', ({ sessionCode, isTyping }) => {
      socket.to(sessionCode).emit('chat:typing', {
        userId: socket.userId,
        isTyping
      });
    });

    // Queue add
    socket.on('queue:add', async ({ sessionCode, songId }) => {
      try {
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
          queue: session.queue
        });
      } catch (error) {
        console.error('Queue add error:', error);
      }
    });

    // Reaction
    socket.on('reaction:add', async ({ sessionCode, emoji }) => {
      socket.to(sessionCode).emit('reaction:added', {
        userId: socket.userId,
        emoji
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId}`);

      if (socket.currentSession) {
        try {
          const session = await Session.findOne({ sessionCode: socket.currentSession });

          if (session) {
            const participant = session.participants.find(
              p => p.userId.toString() === socket.userId
            );

            if (participant) {
              participant.isOnline = false;
              await session.save();
            }

            socket.to(socket.currentSession).emit('user:left', {
              userId: socket.userId
            });
          }
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      }
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
