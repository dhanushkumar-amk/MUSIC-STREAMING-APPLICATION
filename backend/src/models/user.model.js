import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
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
)

export default mongoose.model("User", userSchema)
