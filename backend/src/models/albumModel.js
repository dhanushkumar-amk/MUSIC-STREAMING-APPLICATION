import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    desc: { type: String, required: true, trim: true },
    bgColour: { type: String, required: true },
    image: { type: String, required: true },

    // UPDATED: Artist reference (supports both ObjectId and string for backward compatibility)
    artist: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true
    },

    // NEW: Genre field
    genre: {
      type: String,
      default: null,
      index: true
    },

    // NEW: Release year
    releaseYear: {
      type: Number,
      default: null
    },

    // NEW: Total tracks count
    totalTracks: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

/* Fast search by name */
albumSchema.index({ name: 1 });

export default mongoose.models.album || mongoose.model("album", albumSchema);
