import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { trackPlay, getRecentlyPlayed } from "../controllers/recentlyPlayed.controller.js";

const router = express.Router();

// Track song play
router.post("/track", authMiddleware, trackPlay);

// Fetch recently played
router.get("/list", authMiddleware, getRecentlyPlayed);

export default router;
