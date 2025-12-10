import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

/* ---------------------------------------
   GET USER PROFILE
----------------------------------------*/
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------
   UPDATE USER DETAILS (email, etc.)
----------------------------------------*/
export const updateDetails = async (req, res) => {
  try {
    const updates = req.body;

    // Do not allow password updates here
    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch {
    res.status(500).json({ message: "Error updating profile" });
  }
};

/* ---------------------------------------
   CHANGE PASSWORD
----------------------------------------*/
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match)
      return res.status(400).json({ message: "Old password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.userId, { password: hashed });

    res.json({ success: true, message: "Password updated" });
  } catch {
    res.status(500).json({ message: "Error updating password" });
  }
};

/* ---------------------------------------
   UPLOAD AVATAR → CLOUDINARY R2
----------------------------------------*/
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

    const upload = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "avatars"
    });

    await User.findByIdAndUpdate(req.userId, { avatar: upload.secure_url });

    res.json({
      success: true,
      avatar: upload.secure_url,
      message: "Avatar updated"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Avatar upload failed" });
  }
};
