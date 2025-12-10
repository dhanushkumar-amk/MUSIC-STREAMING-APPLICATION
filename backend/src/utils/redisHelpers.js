import crypto from "crypto"
import redis from "../config/redis.js"

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

export const hashOTP = otp =>
  crypto.createHash("sha256").update(otp).digest("hex")

export const saveOTP = async (key, otp, ttl = 300) => {
  const hashed = hashOTP(otp)
  await redis.set(key, hashed, { ex: ttl })
}

export const verifyOTP = async (key, otp) => {
  const stored = await redis.get(key)
  if (!stored) return false

  const hashed = hashOTP(otp)
  return stored === hashed
}

export const deleteKey = async key => {
  await redis.del(key)
}
