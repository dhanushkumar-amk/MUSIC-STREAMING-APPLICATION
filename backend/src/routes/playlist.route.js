import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createPlaylist,
  getPlaylists,
  getPlaylist,
  updatePlaylist,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSongs,
  toggleCollaborative,
  addCollaborator,
  removeCollaborator,

  // Playback routes (stubs)
  startPlaylistPlayback,
  togglePlaylistShuffle,
  updatePlaylistLoop,
  playlistPlayNext,
  playlistAddToQueue
} from "../controllers/playlist.controller.js";

const router = express.Router();
router.use(authMiddleware);

// CRUD Routes
router.post("/create", createPlaylist);
router.get("/list", getPlaylists);
router.get("/:playlistId", getPlaylist);
router.put("/update", updatePlaylist);
router.post("/rename", renamePlaylist); // Legacy support
router.delete("/delete", deletePlaylist);

// Song Management
router.post("/add-song", addSongToPlaylist);
router.post("/remove-song", removeSongFromPlaylist);
router.post("/reorder", reorderPlaylistSongs);

// Collaborative Features
router.post("/toggle-collaborative", toggleCollaborative);
router.post("/add-collaborator", addCollaborator);
router.post("/remove-collaborator", removeCollaborator);

// Playback Routes (stubs)
router.post("/start-playback", startPlaylistPlayback);
router.post("/toggle-shuffle", togglePlaylistShuffle);
router.post("/update-loop", updatePlaylistLoop);
router.post("/play-next", playlistPlayNext);
router.post("/add-to-queue", playlistAddToQueue);

export default router;
