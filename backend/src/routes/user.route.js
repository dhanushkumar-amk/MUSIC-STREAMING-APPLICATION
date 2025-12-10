import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import avatarUpload from "../middleware/avatarUpload.js";

import {
  getProfile,
  updateDetails,
  changePassword,
  uploadAvatar
} from "../controllers/user.controller.js";

const router = express.Router();

/* GET USER PROFILE */
router.get("/me", authMiddleware, getProfile);

/* UPDATE USER DETAILS */
router.patch("/me/update", authMiddleware, updateDetails);

/* CHANGE PASSWORD */
router.patch("/me/change-password", authMiddleware, changePassword);

/* UPLOAD AVATAR */
router.patch(
  "/me/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  uploadAvatar
);

export default router;
