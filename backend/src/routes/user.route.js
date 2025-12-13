import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import avatarUpload from "../middleware/avatarUpload.js";

import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAllUsers,
  deleteUser
} from "../controllers/user.controller.js";

const router = express.Router();

/* GET USER PROFILE */
router.get("/me", authMiddleware, getProfile);

/* UPDATE USER DETAILS */
router.patch("/me/update", authMiddleware, updateProfile);

/* UPLOAD AVATAR */
router.patch(
  "/me/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  uploadAvatar
);

/* GET ALL USERS (ADMIN/PUBLIC FOR NOW) */
router.get("/list", getAllUsers);

/* DELETE USER (ADMIN) */
router.delete("/:id", deleteUser);

export default router;
