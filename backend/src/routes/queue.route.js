import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { queueSchemas } from "../validators/feature.validator.js";

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

router.post("/start", validate(queueSchemas.startQueue), startQueue);
router.get("/state", getQueueState);

router.get("/next", nextSong);
router.get("/previous", prevSong);

router.post("/shuffle", toggleShuffle);
router.post("/loop", validate(queueSchemas.updateLoopMode), updateLoopMode);

router.post("/add", validate(queueSchemas.addToQueue), addToQueue);
router.post("/play-next", validate(queueSchemas.playNext), playNext);

router.post("/remove", validate(queueSchemas.removeFromQueue), removeFromQueue);
router.delete("/clear", clearQueue);

export default router;
