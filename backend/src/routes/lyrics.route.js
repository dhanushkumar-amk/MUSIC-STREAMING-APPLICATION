import express from "express";
import validate from "../middleware/validate.middleware.js";
import { lyricsSchemas } from "../validators/misc.validator.js";

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
router.get("/:songId", validate(lyricsSchemas.getLyrics), getLyrics);

// Protected routes (Admin only for now)
router.post("/", authMiddleware, validate(lyricsSchemas.addLyrics), upsertLyrics);
router.post("/import-lrc", authMiddleware, importLRC);
router.delete("/:songId", authMiddleware, validate(lyricsSchemas.getLyrics), deleteLyrics);
router.get("/", authMiddleware, getSongsWithLyrics);

export default router;
