import prisma from "../config/database.js";
import { generateOTP } from "../utils/otp.util.js";
import { sendLoginOTPEmail, sendForgotPasswordOTPEmail } from "../services/email.service.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // 4. Create user (unverified)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isEmailVerified: false,
        otp,
        otpExpiry
      }
    });

    // 5. Send OTP
    await sendLoginOTPEmail(email, otp);

    const checkToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

    res.json({
        success: true,
        message: "OTP sent to email",
        userId: user.id,
        checkToken
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* LOGIN USER */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate tokens manually
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Update refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* VERIFY LOGIN OTP */
export const verifyLoginOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if(!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if(user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: userId },
            data: {
                isEmailVerified: true,
                otp: null,
                otpExpiry: null,
                refreshToken
            }
        });

        res.json({
            success: true,
            message: "Email verified successfully",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

/* REFRESH TOKEN */
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) return res.status(401).json({ success: false, message: "No token provided" });

        const user = await prisma.user.findFirst({ where: { refreshToken } });
        if(!user) return res.status(403).json({ success: false, message: "Invalid refresh token" });

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if(err) return res.status(403).json({ success: false, message: "Token expired" });

            const newAccessToken = generateAccessToken(user.id);
            const newRefreshToken = generateRefreshToken(user.id);

            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: newRefreshToken }
            });

            res.json({
                success: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            })
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

/* FORGOT PASSWORD */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.user.update({
            where: { id: user.id },
            data: { otp, otpExpiry }
        });

        await sendForgotPasswordOTPEmail(email, otp);

        res.json({ success: true, message: "Reset code sent to email", userId: user.id });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null
            }
        });

        res.json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* LOGOUT */
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if(refreshToken) {
            // Optional: Remove refresh token from DB if you want to invalidate it immediately
            // But since we are stateless JWT primarily, client just discards it.
            // For extra security:
            const user = await prisma.user.findFirst({ where: { refreshToken } });
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { refreshToken: null }
                });
            }
        }
        res.json({ success: true, message: "Logged out" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
