import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "song",
    required: true,
    unique: true
  },
  globalPlayCount: { type: Number, default: 0 },
  globalSkipCount: { type: Number, default: 0 },
  weightedScore: { type: Number, default: 0 }
});

export default mongoose.model("Recommendation", recommendationSchema);
