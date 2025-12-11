import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylists
} from "../controllers/playlist.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/create", createPlaylist);
router.post("/rename", renamePlaylist);
router.post("/delete", deletePlaylist);

router.post("/add-song", addSongToPlaylist);
router.post("/remove-song", removeSongFromPlaylist);

router.get("/list", getPlaylists);

export default router;
