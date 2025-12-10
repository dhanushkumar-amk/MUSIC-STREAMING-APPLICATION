import jwt from "jsonwebtoken"

export const generateAccessToken = userId =>
  jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE }
  )

export const generateRefreshToken = userId =>
  jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  )

export const verifyRefreshToken = token =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET)
