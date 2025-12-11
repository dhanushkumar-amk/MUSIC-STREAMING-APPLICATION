import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
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
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Playlist", playlistSchema);
