import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  trackStart,
  trackEnd,
  getRecentlyPlayed
} from "../controllers/recentlyPlayed.controller.js";

const router = express.Router();

// START session
router.post("/start", authMiddleware, trackStart);

// END session
router.post("/end", authMiddleware, trackEnd);

// LIST recently played
router.get("/list", authMiddleware, getRecentlyPlayed);

export default router;
