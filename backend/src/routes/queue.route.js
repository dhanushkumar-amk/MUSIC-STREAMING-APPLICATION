import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  startQueue,
  getQueueState,
  nextSong,
  prevSong,
  toggleShuffle,
  updateLoopMode,
  addToQueue,
  playNext,
  removeFromQueue,
  clearQueue
} from "../controllers/queue.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/start", startQueue);
router.get("/state", getQueueState);

router.get("/next", nextSong);
router.get("/previous", prevSong);

router.post("/shuffle", toggleShuffle);
router.post("/loop", updateLoopMode);

router.post("/add", addToQueue);
router.post("/play-next", playNext);

router.post("/remove", removeFromQueue);
router.delete("/clear", clearQueue);

export default router;
