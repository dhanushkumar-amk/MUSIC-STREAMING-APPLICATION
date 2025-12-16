import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    default: 'Listening Party'
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'friends-only'],
    default: 'private'
  },
  currentSong: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'song',
    default: null
  },
  currentTime: {
    type: Number,
    default: 0
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  queue: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'song'
  }],
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: true
    },
    permissions: {
      canControl: {
        type: Boolean,
        default: true
      },
      canAddToQueue: {
        type: Boolean,
        default: true
      }
    }
  }],
  settings: {
    allowGuestControl: {
      type: Boolean,
      default: true
    },
    allowQueueAdd: {
      type: Boolean,
      default: true
    },
    maxParticipants: {
      type: Number,
      default: 10
    }
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Generate unique 6-digit session code
sessionSchema.statics.generateSessionCode = async function() {
  let code;
  let exists = true;

  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = await this.findOne({ sessionCode: code });
  }

  return code;
};

// Auto-delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
