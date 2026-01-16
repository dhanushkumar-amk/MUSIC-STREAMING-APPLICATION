import Session from '../models/session.model.js';
import ChatMessage from '../models/chatMessage.model.js';
import User from '../models/user.model.js';
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
    const session = await Session.findOne({ sessionCode: code });
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

    const session = await Session.create({
      sessionCode,
      name: name || 'Listening Party',
      hostId: userId,
      privacy: privacy || 'private',
      settings: {
        allowGuestControl: settings?.allowGuestControl ?? true,
        allowQueueAdd: settings?.allowQueueAdd ?? true,
        maxParticipants: settings?.maxParticipants ?? 10
      },
      participants: [{
        userId,
        permissions: {
          canControl: true,
          canAddToQueue: true
        }
      }]
    });

    // Populate host and participants
    await session.populate([
      { path: 'hostId', select: 'email avatar' },
      { path: 'participants.userId', select: 'email avatar' }
    ]);

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

    const session = await Session.findOne({ sessionCode: code, isActive: true })
      .populate('hostId', 'email avatar')
      .populate('participants.userId', 'email avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Populate songs from MongoDB
    const currentSong = session.currentSong ? await Song.findById(session.currentSong) : null;
    const queue = await Song.find({ _id: { $in: session.queue } });

    res.json({
      success: true,
      session: {
        ...session.toObject(),
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

    const session = await Session.findOne({ sessionCode: code, isActive: true });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if already in session
    const existingParticipant = session.participants.find(p => p.userId.toString() === userId);

    if (existingParticipant) {
      // Update online status
      existingParticipant.isOnline = true;
      await session.save();

      await session.populate([
        { path: 'hostId', select: 'email avatar' },
        { path: 'participants.userId', select: 'email avatar' }
      ]);

      const currentSong = session.currentSong ? await Song.findById(session.currentSong) : null;
      const queue = await Song.find({ _id: { $in: session.queue } });

      return res.json({
        success: true,
        session: { ...session.toObject(), currentSong, queue },
        message: 'Rejoined session'
      });
    }

    // Check max participants
    if (session.participants.length >= session.settings.maxParticipants) {
      return res.status(403).json({ success: false, message: 'Session is full' });
    }

    // Add participant
    session.participants.push({
      userId,
      permissions: {
        canControl: session.settings.allowGuestControl,
        canAddToQueue: session.settings.allowQueueAdd
      }
    });
    await session.save();

    // Create system message
    await ChatMessage.create({
      sessionId: session._id,
      userId,
      message: 'joined the session',
      type: 'system'
    });

    await session.populate([
      { path: 'hostId', select: 'email avatar' },
      { path: 'participants.userId', select: 'email avatar' }
    ]);

    const currentSong = session.currentSong ? await Song.findById(session.currentSong) : null;
    const queue = await Song.find({ _id: { $in: session.queue } });

    res.json({
      success: true,
      session: { ...session.toObject(), currentSong, queue },
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

    const session = await Session.findOne({ sessionCode: code });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Mark as offline
    const participant = session.participants.find(p => p.userId.toString() === userId);
    if (participant) {
      participant.isOnline = false;
    }

    // If host leaves, transfer to another participant
    if (session.hostId.toString() === userId) {
      const onlineParticipants = session.participants.filter(
        p => p.isOnline && p.userId.toString() !== userId
      );

      if (onlineParticipants.length > 0) {
        session.hostId = onlineParticipants[0].userId;
      } else {
        session.isActive = false;
      }
    }

    await session.save();

    // Create system message
    await ChatMessage.create({
      sessionId: session._id,
      userId,
      message: 'left the session',
      type: 'system'
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

    const session = await Session.findOne({ sessionCode: code });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Only host can update settings
    if (session.hostId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only host can update settings' });
    }

    if (name) session.name = name;
    if (privacy) session.privacy = privacy;
    if (settings) {
      if (settings.allowGuestControl !== undefined) session.settings.allowGuestControl = settings.allowGuestControl;
      if (settings.allowQueueAdd !== undefined) session.settings.allowQueueAdd = settings.allowQueueAdd;
      if (settings.maxParticipants !== undefined) session.settings.maxParticipants = settings.maxParticipants;
    }

    await session.save();

    res.json({
      success: true,
      session,
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

    const session = await Session.findOne({ sessionCode: code });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Only host can end session
    if (session.hostId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only host can end session' });
    }

    session.isActive = false;
    await session.save();

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

    const session = await Session.findOne({ sessionCode: code });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const messages = await ChatMessage.find({ sessionId: session._id })
      .populate('userId', 'email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

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

    const session = await Session.findOne({ sessionCode: code });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const chatMessage = await ChatMessage.create({
      sessionId: session._id,
      userId,
      message,
      type,
      songContext: songContext ? {
        songId: songContext.songId,
        timestamp: songContext.timestamp
      } : undefined
    });

    await chatMessage.populate('userId', 'email avatar');

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

    const session = await Session.findOne({ sessionCode: code });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check permissions
    const participant = session.participants.find(p => p.userId.toString() === userId);

    if (!participant || !participant.permissions.canAddToQueue) {
      return res.status(403).json({ success: false, message: 'No permission to add to queue' });
    }

    // Verify song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    session.queue.push(songId);
    session.lastUpdate = new Date();
    await session.save();

    const queue = await Song.find({ _id: { $in: session.queue } });

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
    const sessions = await Session.find({
      isActive: true,
      privacy: 'public',
      expiresAt: { $gt: new Date() }
    })
      .populate('hostId', 'email avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    // Populate current songs
    const sessionsWithSongs = await Promise.all(
      sessions.map(async (session) => {
        const currentSong = session.currentSong ? await Song.findById(session.currentSong) : null;
        return {
          sessionCode: session.sessionCode,
          name: session.name,
          hostId: session.hostId._id,
          host: session.hostId,
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
