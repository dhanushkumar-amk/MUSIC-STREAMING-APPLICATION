import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    desc: { type: String, required: true, trim: true },
    album: { type: String, required: true, index: true },
    image: { type: String, required: true },
    file: { type: String, required: true },
    duration: { type: String, required: true }
  },
  { timestamps: true }
);

/* Optimize frequent queries */
songSchema.index({ album: 1 });
songSchema.index({ name: "text" });

export default mongoose.models.song || mongoose.model("song", songSchema);
