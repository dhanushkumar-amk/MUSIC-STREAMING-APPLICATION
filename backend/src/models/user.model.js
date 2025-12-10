import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

/* Additional optimization */
userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);
