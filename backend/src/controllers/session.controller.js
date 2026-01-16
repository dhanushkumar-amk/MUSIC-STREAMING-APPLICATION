import prisma from '../config/database.js';
import Song from '../models/songModel.js';

// Helper function to generate unique session code
async function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;

  while (exists) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const session = await prisma.session.findUnique({ where: { sessionCode: code } });
    exists = !!session;
  }

  return code;
}

// Create new session
export const createSession = async (req, res) => {
  try {
    const { name, privacy, settings } = req.body;
    const userId = req.userId;

    // Generate unique session code
    const sessionCode = await generateSessionCode();

    const session = await prisma.session.create({
      data: {
        sessionCode,
        name: name || 'Listening Party',
        hostId: userId,
        privacy: privacy || 'private',
        allowGuestControl: settings?.allowGuestControl ?? true,
        allowQueueAdd: settings?.allowQueueAdd ?? true,
        maxParticipants: settings?.maxParticipants ?? 10,
        participants: {
          create: [{
            userId,
            canControl: true,
            canAddToQueue: true
          }]
        }
      },
      include: {
        host: { select: { id: true, email: true, avatar: true } },
        participants: {
          include: {
            user: { select: { id: true, email: true, avatar: true } }
          }
        }
      }
    });

    res.json({
      success: true,
      session,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get session details
export const getSession = async (req, res) => {
  try {
    const { code } = req.params;

    const session = await prisma.session.findFirst({
      where: { sessionCode: code, isActive: true },
      include: {
        host: { select: { id: true, email: true, avatar: true } },
        participants: {
          include: {
            user: { select: { id: true, email: true, avatar: true } }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Populate songs from MongoDB
    const currentSong = session.currentSongId ? await Song.findById(session.currentSongId) : null;
    const queue = await Song.find({ _id: { $in: session.queueIds } });

    res.json({
      success: true,
      session: {
        ...session,
        currentSong,
        queue
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join session
export const joinSession = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.userId;

    const session = await prisma.session.findFirst({
      where: { sessionCode: code, isActive: true },
      include: {
        participants: true
      }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if already in session
    const existingParticipant = session.participants.find(p => p.userId === userId);

    if (existingParticipant) {
      // Update online status
      await prisma.sessionParticipant.update({
        where: { id: existingParticipant.id },
        data: { isOnline: true }
      });

      const updatedSession = await prisma.session.findUnique({
        where: { id: session.id },
        include: {
          host: { select: { id: true, email: true, avatar: true } },
          participants: {
            include: {
              user: { select: { id: true, email: true, avatar: true } }
            }
          }
        }
      });

      const currentSong = updatedSession.currentSongId ? await Song.findById(updatedSession.currentSongId) : null;
      const queue = await Song.find({ _id: { $in: updatedSession.queueIds } });

      return res.json({
        success: true,
        session: { ...updatedSession, currentSong, queue },
        message: 'Rejoined session'
      });
    }

    // Check max participants
    if (session.participants.length >= session.maxParticipants) {
      return res.status(403).json({ success: false, message: 'Session is full' });
    }

    // Add participant
    await prisma.sessionParticipant.create({
      data: {
        sessionId: session.id,
        userId,
        canControl: session.allowGuestControl,
        canAddToQueue: session.allowQueueAdd
      }
    });

    // Create system message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        userId,
        message: 'joined the session',
        type: 'system'
      }
    });

    const updatedSession = await prisma.session.findUnique({
      where: { id: session.id },
      include: {
        host: { select: { id: true, email: true, avatar: true } },
        participants: {
          include: {
            user: { select: { id: true, email: true, avatar: true } }
          }
        }
      }
    });

    const currentSong = updatedSession.currentSongId ? await Song.findById(updatedSession.currentSongId) : null;
    const queue = await Song.find({ _id: { $in: updatedSession.queueIds } });

    res.json({
      success: true,
      session: { ...updatedSession, currentSong, queue },
      message: 'Joined session successfully'
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Leave session
export const leaveSession = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.userId;

    const session = await prisma.session.findFirst({
      where: { sessionCode: code },
      include: { participants: true }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Mark as offline
    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      await prisma.sessionParticipant.update({
        where: { id: participant.id },
        data: { isOnline: false }
      });
    }

    // If host leaves, transfer to another participant
    if (session.hostId === userId) {
      const onlineParticipants = session.participants.filter(
        p => p.isOnline && p.userId !== userId
      );

      if (onlineParticipants.length > 0) {
        await prisma.session.update({
          where: { id: session.id },
          data: { hostId: onlineParticipants[0].userId }
        });
      } else {
        await prisma.session.update({
          where: { id: session.id },
          data: { isActive: false }
        });
      }
    }

    // Create system message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        userId,
        message: 'left the session',
        type: 'system'
      }
    });

    res.json({
      success: true,
      message: 'Left session successfully'
    });
  } catch (error) {
    console.error('Leave session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update session settings
export const updateSessionSettings = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.userId;
    const { name, privacy, settings } = req.body;

    const session = await prisma.session.findFirst({
      where: { sessionCode: code }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Only host can update settings
    if (session.hostId !== userId) {
      return res.status(403).json({ success: false, message: 'Only host can update settings' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (privacy) updateData.privacy = privacy;
    if (settings) {
      if (settings.allowGuestControl !== undefined) updateData.allowGuestControl = settings.allowGuestControl;
      if (settings.allowQueueAdd !== undefined) updateData.allowQueueAdd = settings.allowQueueAdd;
      if (settings.maxParticipants !== undefined) updateData.maxParticipants = settings.maxParticipants;
    }

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: updateData
    });

    res.json({
      success: true,
      session: updatedSession,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// End session
export const endSession = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.userId;

    const session = await prisma.session.findFirst({
      where: { sessionCode: code }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Only host can end session
    if (session.hostId !== userId) {
      return res.status(403).json({ success: false, message: 'Only host can end session' });
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { code } = req.params;
    const { limit = 50 } = req.query;

    const session = await prisma.session.findFirst({
      where: { sessionCode: code }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      include: {
        user: { select: { id: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send chat message
export const sendChatMessage = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.userId;
    const { message, type = 'text', songContext } = req.body;

    const session = await prisma.session.findFirst({
      where: { sessionCode: code }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        userId,
        message,
        type,
        songContextId: songContext?.songId,
        songTimestamp: songContext?.timestamp
      },
      include: {
        user: { select: { id: true, email: true, avatar: true } }
      }
    });

    res.json({
      success: true,
      message: chatMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add song to queue
export const addToQueue = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.userId;
    const { songId } = req.body;

    const session = await prisma.session.findFirst({
      where: { sessionCode: code },
      include: { participants: true }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check permissions
    const participant = session.participants.find(p => p.userId === userId);

    if (!participant || !participant.canAddToQueue) {
      return res.status(403).json({ success: false, message: 'No permission to add to queue' });
    }

    // Verify song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        queueIds: { push: songId },
        lastUpdate: new Date()
      }
    });

    const queue = await Song.find({ _id: { $in: updatedSession.queueIds } });

    res.json({
      success: true,
      queue,
      message: 'Song added to queue'
    });
  } catch (error) {
    console.error('Add to queue error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active sessions (public)
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        isActive: true,
        privacy: 'public',
        expiresAt: { gt: new Date() }
      },
      include: {
        host: { select: { id: true, email: true, avatar: true } },
        participants: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Populate current songs
    const sessionsWithSongs = await Promise.all(
      sessions.map(async (session) => {
        const currentSong = session.currentSongId ? await Song.findById(session.currentSongId) : null;
        return {
          sessionCode: session.sessionCode,
          name: session.name,
          hostId: session.hostId,
          host: session.host,
          currentSong,
          participants: session.participants,
          createdAt: session.createdAt
        };
      })
    );

    res.json({
      success: true,
      sessions: sessionsWithSongs
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
