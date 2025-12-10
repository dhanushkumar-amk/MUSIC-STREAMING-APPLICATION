import express from 'express'
import { forgotPassword, login, logout, refreshToken, register, resetPassword, verifyLoginOTP } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/login/verify-otp", verifyLoginOTP);

authRouter.post("/refresh-token", refreshToken);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

authRouter.post("/logout", authMiddleware, logout);


export default authRouter
