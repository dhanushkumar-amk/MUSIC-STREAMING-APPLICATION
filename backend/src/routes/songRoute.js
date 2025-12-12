import express from "express";
import upload from "../middleware/multer.js";
import { addSong, listSong, removeSong } from "../controllers/songController.js";

const router = express.Router();

router.post(
  "/add",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 }
  ]),
  addSong
);

router.get("/list", listSong);
router.post("/remove", removeSong);

export default router;
