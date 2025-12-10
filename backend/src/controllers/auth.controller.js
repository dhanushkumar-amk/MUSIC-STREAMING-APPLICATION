import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import redis from "../config/redis.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/token.util.js";

/* ---------------------------------------------------------
   REGISTER → RETURN JWT IMMEDIATELY
----------------------------------------------------------*/
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in Redis
    await redis.set(`refresh:${user._id}`, refreshToken, {
      ex: 60 * 60 * 24 * 7
    });

    res.status(201).json({
      message: "Registered successfully",
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------------------------
   LOGIN → EMAIL + PASSWORD → RETURN JWT
----------------------------------------------------------*/
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to Redis
    await redis.set(`refresh:${user._id}`, refreshToken, {
      ex: 60 * 60 * 24 * 7
    });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* ---------------------------------------------------------
   REFRESH TOKEN
----------------------------------------------------------*/
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const stored = await redis.get(`refresh:${decoded.userId}`);
  if (stored !== refreshToken)
    return res.status(401).json({ message: "Session expired" });

  const newAccessToken = generateAccessToken(decoded.userId);

  res.json({ accessToken: newAccessToken });
};

/* ---------------------------------------------------------
   FORGOT PASSWORD → SEND RESET OTP
   (OTP only used here, safe to keep)
----------------------------------------------------------*/
import { generateOTP, hashOTP } from "../utils/otp.util.js";
import { sendForgotPasswordOTPEmail } from "../services/email.service.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = generateOTP();
  await redis.set(`otp:reset:${user._id}`, hashOTP(otp), { ex: 300 });

  await sendForgotPasswordOTPEmail(email, otp);

  res.json({ message: "OTP sent", userId: user._id });
};

/* ---------------------------------------------------------
   RESET PASSWORD
----------------------------------------------------------*/
export const resetPassword = async (req, res) => {
  const { userId, otp, newPassword } = req.body;

  const key = `otp:reset:${userId}`;
  const stored = await redis.get(key);

  if (!stored || stored !== hashOTP(otp))
    return res.status(400).json({ message: "Invalid or expired OTP" });

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashed });

  await redis.del(key);

  res.json({ message: "Password updated successfully" });
};

/* ---------------------------------------------------------
   LOGOUT → INVALIDATE JWT (delete refresh token)
----------------------------------------------------------*/
export const logout = async (req, res) => {
  try {
    const { userId } = req.body;

    await redis.del(`refresh:${userId}`);

    res.json({ message: "Logged out successfully" });
  } catch {
    res.status(500).json({ message: "Logout failed" });
  }
};
