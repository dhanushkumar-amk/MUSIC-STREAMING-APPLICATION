import express from 'express'
import { forgotPassword, login, logout, refreshToken, register, resetPassword, verifyLoginOTP } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { authSchemas } from '../validators/auth.validator.js';

const authRouter = express.Router();

authRouter.post("/register", validate(authSchemas.register), register);
authRouter.post("/login", validate(authSchemas.login), login);
authRouter.post("/login/verify-otp", validate(authSchemas.verifyLoginOTP), verifyLoginOTP);

authRouter.post("/refresh-token", validate(authSchemas.refreshToken), refreshToken);

authRouter.post("/forgot-password", validate(authSchemas.forgotPassword), forgotPassword);
authRouter.post("/reset-password", validate(authSchemas.resetPassword), resetPassword);

authRouter.post("/logout", authMiddleware, validate(authSchemas.logout), logout);


export default authRouter
