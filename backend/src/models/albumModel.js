import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    desc: { type: String, required: true, trim: true },
    bgColour: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

/* Fast search by name */
albumSchema.index({ name: 1 });

export default mongoose.models.album || mongoose.model("album", albumSchema);
