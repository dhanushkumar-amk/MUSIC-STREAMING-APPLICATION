import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import redis from "../config/redis.js"

import { generateOTP, hashOTP } from "../utils/otp.util.js"
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/token.util.js"

import {
  sendLoginOTPEmail,
  sendForgotPasswordOTPEmail,
  sendWelcomeEmail
} from "../services/email.service.js"

export const register = async (req, res) => {
  const { email, password } = req.body

  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ message: "User already exists" })

  const hashed = await bcrypt.hash(password, 10)
  await User.create({ email, password: hashed })

  await sendWelcomeEmail(email)

  res.status(201).json({ message: "Registered successfully" })
}

export const login = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ message: "User not found" })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ message: "Invalid credentials" })

  const otp = generateOTP()
  await redis.set(`otp:login:${user._id}`, hashOTP(otp), { ex: 300 })

  await sendLoginOTPEmail(email, otp)

  res.json({ message: "OTP sent", userId: user._id })
}

export const verifyLoginOTP = async (req, res) => {
  const { userId, otp } = req.body

  const key = `otp:login:${userId}`
  const stored = await redis.get(key)

  if (!stored || stored !== hashOTP(otp))
    return res.status(400).json({ message: "Invalid or expired OTP" })

  await redis.del(key)

  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken(userId)

  await redis.set(`refresh:${userId}`, refreshToken, {
    ex: 60 * 60 * 24 * 7
  })

  res.json({ accessToken, refreshToken })
}

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body

  let decoded
  try {
    decoded = verifyRefreshToken(refreshToken)
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" })
  }

  const stored = await redis.get(`refresh:${decoded.userId}`)
  if (stored !== refreshToken)
    return res.status(401).json({ message: "Session expired" })

  const newAccessToken = generateAccessToken(decoded.userId)

  res.json({ accessToken: newAccessToken })
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ message: "User not found" })

  const otp = generateOTP()
  await redis.set(`otp:reset:${user._id}`, hashOTP(otp), { ex: 300 })

  await sendForgotPasswordOTPEmail(email, otp)

  res.json({ message: "OTP sent", userId: user._id })
}

export const resetPassword = async (req, res) => {
  const { userId, otp, newPassword } = req.body

  const key = `otp:reset:${userId}`
  const stored = await redis.get(key)

  if (!stored || stored !== hashOTP(otp))
    return res.status(400).json({ message: "Invalid or expired OTP" })

  const hashed = await bcrypt.hash(newPassword, 10)
  await User.findByIdAndUpdate(userId, { password: hashed })

  await redis.del(key)

  res.json({ message: "Password updated successfully" })
}

export const logout = async (req, res) => {
  const { userId } = req.body
  await redis.del(`refresh:${userId}`)
  res.json({ message: "Logged out successfully" })
}
