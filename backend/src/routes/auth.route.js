import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"

import {
  register,
  login,
  verifyLoginOTP,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout
} from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/login/verify-otp", verifyLoginOTP)

router.post("/refresh-token", refreshToken)

router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

router.post("/logout", authMiddleware, logout)

export default router
