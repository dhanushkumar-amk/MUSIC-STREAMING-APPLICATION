import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  likeSong,
  unlikeSong,
  getLikedSongs,
  likeAlbum,
  unlikeAlbum,
  getLikedAlbums
} from "../controllers/library.controller.js";

const router = express.Router();

/* LIKED SONGS */
router.post("/song/like", authMiddleware, likeSong);
router.post("/song/unlike", authMiddleware, unlikeSong);
router.get("/song/list", authMiddleware, getLikedSongs);

/* LIKED ALBUMS */
router.post("/album/like", authMiddleware, likeAlbum);
router.post("/album/unlike", authMiddleware, unlikeAlbum);
router.get("/album/list", authMiddleware, getLikedAlbums);

export default router;
