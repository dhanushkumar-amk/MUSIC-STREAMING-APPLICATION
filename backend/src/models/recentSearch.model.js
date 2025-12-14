import mongoose from "mongoose";

const recentSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['song', 'album', 'user', 'query'],
    default: 'query'
  },
  resultId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type'
  },
  searchedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
recentSearchSchema.index({ userId: 1, searchedAt: -1 });

// TTL index to auto-delete old searches after 30 days
recentSearchSchema.index({ searchedAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model("RecentSearch", recentSearchSchema);
