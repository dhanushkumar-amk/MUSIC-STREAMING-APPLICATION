import mongoose from "mongoose";

const recentlyPlayedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song",
      required: true
    },
    // NEW fields
    playDuration: { type: Number, default: 0 }, // seconds
    skipped: { type: Boolean, default: false },
    contextType: { type: String, default: null }, // 'playlist'|'album'|'liked'|'search' etc
    contextId: { type: String, default: null }, // optional id of playlist/album
    // Keep playedAt
    playedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("RecentlyPlayed", recentlyPlayedSchema);
