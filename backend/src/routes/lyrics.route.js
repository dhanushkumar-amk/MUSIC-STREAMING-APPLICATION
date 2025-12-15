import express from "express";
import {
  getLyrics,
  upsertLyrics,
  deleteLyrics,
  importLRC,
  getSongsWithLyrics
} from "../controllers/lyrics.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/:songId", getLyrics);

// Protected routes (Admin only for now)
router.post("/", authMiddleware, upsertLyrics);
router.post("/import-lrc", authMiddleware, importLRC);
router.delete("/:songId", authMiddleware, deleteLyrics);
router.get("/", authMiddleware, getSongsWithLyrics);

export default router;
