import mongoose from "mongoose";

const lyricsSchema = new mongoose.Schema(
  {
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song",
      required: true,
      unique: true,
      index: true
    },

    // Plain text lyrics
    plainLyrics: {
      type: String,
      default: ""
    },

    // Synchronized lyrics (LRC format)
    syncedLyrics: [
      {
        time: {
          type: Number, // Time in seconds
          required: true
        },
        text: {
          type: String,
          required: true
        }
      }
    ],

    language: {
      type: String,
      default: "en"
    },

    source: {
      type: String,
      enum: ["manual", "musixmatch", "genius", "lrclib", "other"],
      default: "manual"
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for faster queries
lyricsSchema.index({ songId: 1 });

export default mongoose.model("Lyrics", lyricsSchema);
