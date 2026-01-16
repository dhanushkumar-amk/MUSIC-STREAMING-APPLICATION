
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { playlistSchemas } from "../validators/playlist.validator.js";

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
router.post("/create", validate(playlistSchemas.createPlaylist), createPlaylist);
router.get("/list", validate(playlistSchemas.getPlaylists), getPlaylists);
router.get("/:playlistId", validate(playlistSchemas.getPlaylist), getPlaylist);
router.put("/update", validate(playlistSchemas.updatePlaylist), updatePlaylist);
router.post("/rename", validate(playlistSchemas.renamePlaylist), renamePlaylist); // Legacy support
router.delete("/delete", validate(playlistSchemas.deletePlaylist), deletePlaylist);

// Song Management
router.post("/add-song", validate(playlistSchemas.addSongToPlaylist), addSongToPlaylist);
router.post("/remove-song", validate(playlistSchemas.removeSongFromPlaylist), removeSongFromPlaylist);
router.post("/reorder", validate(playlistSchemas.reorderPlaylistSongs), reorderPlaylistSongs);

// Collaborative Features
router.post("/toggle-collaborative", validate(playlistSchemas.toggleCollaborative), toggleCollaborative);
router.post("/add-collaborator", validate(playlistSchemas.addCollaborator), addCollaborator);
router.post("/remove-collaborator", validate(playlistSchemas.removeCollaborator), removeCollaborator);

// Playback Routes (stubs)
router.post("/start-playback", validate(playlistSchemas.startPlaylistPlayback), startPlaylistPlayback);
router.post("/toggle-shuffle", validate(playlistSchemas.togglePlaylistShuffle), togglePlaylistShuffle);
router.post("/update-loop", validate(playlistSchemas.updatePlaylistLoop), updatePlaylistLoop);
router.post("/play-next", validate(playlistSchemas.playlistPlayNext), playlistPlayNext);
router.post("/add-to-queue", validate(playlistSchemas.playlistAddToQueue), playlistAddToQueue);

export default router;
