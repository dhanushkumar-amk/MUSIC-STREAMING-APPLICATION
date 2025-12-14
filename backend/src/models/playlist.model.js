import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    desc: {
      type: String,
      default: "",
      trim: true
    },
    banner: {
      type: String,
      default: null
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "song"
      }
    ],
    isPublic: {
      type: Boolean,
      default: false
    },
    collaborative: {
      type: Boolean,
      default: false
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    shuffleEnabled: {
      type: Boolean,
      default: false
    },
    loopMode: {
      type: String,
      enum: ["off", "one", "all"],
      default: "off"
    }
  },
  { timestamps: true }
);

// Index for faster queries
playlistSchema.index({ userId: 1, createdAt: -1 });
playlistSchema.index({ isPublic: 1 });

export default mongoose.model("Playlist", playlistSchema);
