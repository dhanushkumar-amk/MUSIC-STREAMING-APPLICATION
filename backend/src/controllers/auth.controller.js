import User from "../models/user.model.js";
import { generateOTP } from "../utils/otp.util.js";
import { sendLoginOTPEmail, sendForgotPasswordOTPEmail } from "../services/email.service.js"; // Import forgot password email too
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

    // 3. Create user (unverified)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false
    });

    const user = await newUser.save();

    // 4. Send OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

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
    user.refreshToken = refreshToken;
    await user.save();

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

        if(user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

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

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if(err) return res.status(403).json({ success: false, message: "Token expired" });

            const newAccessToken = generateAccessToken(user._id);
            const newRefreshToken = generateRefreshToken(user._id);

            user.refreshToken = newRefreshToken;
            user.save();

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
        user.otp = otp;
        user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

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

        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

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
            await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
        }
        res.json({ success: true, message: "Logged out" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
