import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from "bcrypt";

/* GET USER PROFILE */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password -refreshToken -otp");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* UPDATE PROFILE */
export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { name },
            { new: true }
        ).select("-password -refreshToken");

        res.json({ success: true, user, message: "Profile updated" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* UPLOAD AVATAR */
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No image uploaded" });

        const imageUpload = await cloudinary.uploader.upload(req.file.path, {
            folder: "avatars",
            width: 500,
            crop: "scale"
        });

        const user = await User.findByIdAndUpdate(
            req.userId,
            { avatar: imageUpload.secure_url },
            { new: true }
        ).select("-password");

        res.json({ success: true, avatar: user.avatar, message: "Avatar updated" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* GET ALL USERS (ADMIN) */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password -refreshToken -otp").sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* DELETE USER (ADMIN) */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to delete user" });
    }
};
