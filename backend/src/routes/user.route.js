import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import avatarUpload from "../middleware/avatarUpload.js";

import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  getAccountStats,
  deleteAccount,
  getAllUsers,
  deleteUser
} from "../controllers/user.controller.js";

const router = express.Router();

/* ==================== PROFILE ROUTES ==================== */

/* GET USER PROFILE */
router.get("/me", authMiddleware, getProfile);

/* UPDATE USER PROFILE (NAME & BIO) */
router.patch("/me/update", authMiddleware, updateProfile);

/* UPLOAD AVATAR */
router.patch(
  "/me/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  uploadAvatar
);

/* DELETE AVATAR */
router.delete("/me/avatar", authMiddleware, deleteAvatar);

/* ==================== PASSWORD & SECURITY ==================== */

/* CHANGE PASSWORD */
router.patch("/me/change-password", authMiddleware, changePassword);

/* ==================== ACCOUNT MANAGEMENT ==================== */

/* GET ACCOUNT STATS */
router.get("/me/stats", authMiddleware, getAccountStats);

/* DELETE ACCOUNT */
router.delete("/me/account", authMiddleware, deleteAccount);

/* ==================== ADMIN ROUTES ==================== */

/* GET ALL USERS (ADMIN) */
router.get("/list", getAllUsers);

/* DELETE USER (ADMIN) */
router.delete("/:id", deleteUser);

export default router;
