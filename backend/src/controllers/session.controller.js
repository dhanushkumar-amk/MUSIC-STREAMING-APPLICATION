import Session from '../models/session.model.js';
import ChatMessage from '../models/chatMessage.model.js';
import Song from '../models/songModel.js';

// Create new session
export const createSession = async (req, res) => {
  try {
    const { name, privacy, settings } = req.body;
    const userId = req.userId;

    // Generate unique session code
    const sessionCode = await Session.generateSessionCode();

    const session = await Session.create({
      sessionCode,
      name: name || 'Listening Party',
      hostId: userId,
      privacy: privacy || 'private',
      participants: [{
        userId,
        permissions: {
          canControl: true,
          canAddToQueue: true
        }
      }],
      settings: settings || {}
    });

    await session.populate('hostId', 'email avatar');
    await session.populate('participants.userId', 'email avatar');

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
      .populate('participants.userId', 'email avatar')
      .populate('currentSong')
      .populate('queue');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, session });
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
    const alreadyJoined = session.participants.some(
      p => p.userId.toString() === userId
    );

    if (alreadyJoined) {
      // Update online status
      const participant = session.participants.find(
        p => p.userId.toString() === userId
      );
      participant.isOnline = true;
      await session.save();

      await session.populate('hostId', 'email avatar');
      await session.populate('participants.userId', 'email avatar');
      await session.populate('currentSong');
      await session.populate('queue');

      return res.json({
        success: true,
        session,
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
    await session.populate('hostId', 'email avatar');
    await session.populate('participants.userId', 'email avatar');
    await session.populate('currentSong');
    await session.populate('queue');

    // Create system message
    await ChatMessage.create({
      sessionId: session._id,
      userId,
      message: 'joined the session',
      type: 'system'
    });

    res.json({
      success: true,
      session,
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

    // Mark as offline instead of removing
    const participant = session.participants.find(
      p => p.userId.toString() === userId
    );

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
    if (settings) session.settings = { ...session.settings, ...settings };

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
      songContext
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
    const participant = session.participants.find(
      p => p.userId.toString() === userId
    );

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

    await session.populate('queue');

    res.json({
      success: true,
      queue: session.queue,
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
      .populate('currentSong')
      .select('sessionCode name hostId currentSong participants createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
