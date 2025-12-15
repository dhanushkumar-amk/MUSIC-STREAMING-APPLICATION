import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // Audio Quality Settings
    audioQuality: {
      type: String,
      enum: ["low", "medium", "high", "very_high"],
      default: "high"
    },

    // Playback Settings
    crossfadeDuration: {
      type: Number,
      min: 0,
      max: 12,
      default: 0 // 0 = disabled, 1-12 seconds
    },

    gaplessPlayback: {
      type: Boolean,
      default: true
    },

    normalizeVolume: {
      type: Boolean,
      default: false
    },

    playbackSpeed: {
      type: Number,
      min: 0.5,
      max: 2.0,
      default: 1.0
    },

    // Equalizer Settings (10-band EQ)
    equalizerEnabled: {
      type: Boolean,
      default: false
    },

    equalizerPreset: {
      type: String,
      enum: ["flat", "rock", "pop", "jazz", "classical", "electronic", "hip-hop", "custom"],
      default: "flat"
    },

    equalizerBands: {
      // Frequencies: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
      band32: { type: Number, min: -12, max: 12, default: 0 },
      band64: { type: Number, min: -12, max: 12, default: 0 },
      band125: { type: Number, min: -12, max: 12, default: 0 },
      band250: { type: Number, min: -12, max: 12, default: 0 },
      band500: { type: Number, min: -12, max: 12, default: 0 },
      band1k: { type: Number, min: -12, max: 12, default: 0 },
      band2k: { type: Number, min: -12, max: 12, default: 0 },
      band4k: { type: Number, min: -12, max: 12, default: 0 },
      band8k: { type: Number, min: -12, max: 12, default: 0 },
      band16k: { type: Number, min: -12, max: 12, default: 0 }
    },

    // Lyrics Settings
    lyricsEnabled: {
      type: Boolean,
      default: true
    },

    lyricsLanguage: {
      type: String,
      default: "en"
    }
  },
  { timestamps: true }
);

// Index for faster queries
userSettingsSchema.index({ userId: 1 });

export default mongoose.model("UserSettings", userSettingsSchema);
