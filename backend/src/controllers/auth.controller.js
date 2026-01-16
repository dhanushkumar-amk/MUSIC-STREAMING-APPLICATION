import User from "../models/user.model.js";
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
    const exists = await User.findOne({ email });
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
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      otp,
      otpExpiry
    });

    // 5. Send OTP
    await sendLoginOTPEmail(email, otp);

    const checkToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

    res.json({
        success: true,
        message: "OTP sent to email",
        userId: user._id,
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate tokens manually
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update refresh token in DB
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
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

        const user = await User.findById(userId);
        if(!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if(user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        await User.findByIdAndUpdate(userId, {
            isEmailVerified: true,
            otp: null,
            otpExpiry: null,
            refreshToken
        });

        res.json({
            success: true,
            message: "Email verified successfully",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
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

        const user = await User.findOne({ refreshToken });
        if(!user) return res.status(403).json({ success: false, message: "Invalid refresh token" });

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if(err) return res.status(403).json({ success: false, message: "Token expired" });

            const newAccessToken = generateAccessToken(user._id);
            const newRefreshToken = generateRefreshToken(user._id);

            await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

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
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

        await sendForgotPasswordOTPEmail(email, otp);

        res.json({ success: true, message: "Reset code sent to email", userId: user._id });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, {
            password: hashedPassword,
            otp: null,
            otpExpiry: null
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
            const user = await User.findOne({ refreshToken });
            if (user) {
                await User.findByIdAndUpdate(user._id, { refreshToken: null });
            }
        }
        res.json({ success: true, message: "Logged out" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
