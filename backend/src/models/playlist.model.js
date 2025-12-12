import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: { type: String, required: true },

    banner: { type: String, default: null },

    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "song"
      }
    ],

    // NEW
    shuffleEnabled: { type: Boolean, default: false },
    loopMode: {
      type: String,
      enum: ["off", "one", "all"],
      default: "off"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Playlist", playlistSchema);
