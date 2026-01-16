import express from "express";
import upload from "../middleware/multer.js";
import validate from "../middleware/validate.middleware.js";
import { songSchemas } from "../validators/media.validator.js";
import { addSong, listSong, removeSong, getPaginatedSongs } from "../controllers/songController.js";

const router = express.Router();

router.post(
  "/add",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 }
  ]),
  validate(songSchemas.addSong),
  addSong
);

router.get("/list", listSong);
router.get("/paginated", validate(songSchemas.getPaginatedSongs), getPaginatedSongs);
router.post("/remove", validate(songSchemas.removeSong), removeSong);

export default router;
