import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100
    },
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
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      default: null,
      maxlength: 500
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String,
      default: null
    },
    otp: {
      type: String,
      default: null
    },
    otpExpiry: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.otp;
        delete ret.otpExpiry;
        return ret;
      }
    }
  }
);

/* Indexes for optimization */
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model("User", userSchema);
