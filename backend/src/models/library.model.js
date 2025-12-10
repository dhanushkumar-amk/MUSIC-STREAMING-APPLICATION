import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    likedSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "song"
      }
    ],
    likedAlbums: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "album"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Library", librarySchema);
