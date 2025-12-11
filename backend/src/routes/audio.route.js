import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { streamAudio } from "../controllers/audioStream.controller.js";
import { getNextSong } from "../controllers/preload.controller.js";

const router = express.Router();

router.get("/stream/:songId", authMiddleware, streamAudio);
router.get("/next/:currentSongId", authMiddleware, getNextSong);

export default router;
