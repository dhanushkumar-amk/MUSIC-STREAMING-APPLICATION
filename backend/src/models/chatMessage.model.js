import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['text', 'system', 'reaction', 'song'],
    default: 'text'
  },
  songContext: {
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    timestamp: Number
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });

// Auto-delete messages after session expires (30 days)
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
