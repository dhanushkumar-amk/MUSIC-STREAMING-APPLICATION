import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },

  // UPDATED: Artist reference (ObjectId) - supports both old string and new ObjectId
  artist: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    index: true
  },

  // UPDATED: Album reference (can be ObjectId or string for backward compatibility)
  album: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  image: { type: String, required: true },
  file: { type: String, required: true },
  duration: { type: String, required: true },

  // NEW: Genre field
  genre: {
    type: String,
    default: null,
    index: true
  },

  // Existing fields
  playCount: { type: Number, default: 0 },
  uniqueListeners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


}, { timestamps: true });

const songModel = mongoose.models.song || mongoose.model("song", songSchema);

export default songModel;
