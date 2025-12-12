import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylists,

  // NEW IMPORTS
  startPlaylistPlayback,
  togglePlaylistShuffle,
  updatePlaylistLoop,
  playlistPlayNext,
  playlistAddToQueue
} from "../controllers/playlist.controller.js";

const router = express.Router();
router.use(authMiddleware);

// EXISTING ROUTES
router.post("/create", createPlaylist);
router.post("/rename", renamePlaylist);
router.post("/delete", deletePlaylist);
router.post("/add-song", addSongToPlaylist);
router.post("/remove-song", removeSongFromPlaylist);
router.get("/list", getPlaylists);

// NEW PLAYBACK ROUTES
router.post("/start-playback", startPlaylistPlayback);
router.post("/toggle-shuffle", togglePlaylistShuffle);
router.post("/update-loop", updatePlaylistLoop);
router.post("/play-next", playlistPlayNext);
router.post("/add-to-queue", playlistAddToQueue);

export default router;
