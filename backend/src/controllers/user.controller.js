import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { cloudinary } from "../config/cloudinary.js";

/* GET PROFILE */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.userId).select("-password").lean();

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ success: true, user });
};

/* UPDATE USER DETAILS */
export const updateDetails = async (req, res) => {
  const updates = { ...req.body };

  delete updates.password;

  const updatedUser = await User.findByIdAndUpdate(
    req.userId,
    updates,
    { new: true }
  )
    .select("-password")
    .lean();

  res.json({ success: true, user: updatedUser });
};

/* CHANGE PASSWORD */
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match)
    return res.status(400).json({ message: "Old password is incorrect" });

  const hashed = await bcrypt.hash(newPassword, 12);

  await User.findByIdAndUpdate(req.userId, { password: hashed });

  res.json({ success: true, message: "Password updated" });
};

/* UPLOAD AVATAR */
export const uploadAvatar = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No image uploaded" });

  const upload = await cloudinary.uploader.upload_stream(
    {
      folder: "avatars",
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto"
    },
    async (error, result) => {
      if (error) return res.status(500).json({ message: "Upload failed" });

      await User.findByIdAndUpdate(req.userId, { avatar: result.secure_url });

      res.json({
        success: true,
        avatar: result.secure_url,
        message: "Avatar updated"
      });
    }
  );

  upload.end(req.file.buffer);
};
