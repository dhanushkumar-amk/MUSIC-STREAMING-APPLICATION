import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { librarySchemas } from "../validators/feature.validator.js";

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
router.post("/song/like", authMiddleware, validate(librarySchemas.likeSong), likeSong);
router.post("/song/unlike", authMiddleware, validate(librarySchemas.unlikeSong), unlikeSong);
router.get("/song/list", authMiddleware, validate(librarySchemas.getLikedSongs), getLikedSongs);

/* LIKED ALBUMS */
router.post("/album/like", authMiddleware, validate(librarySchemas.likeAlbum), likeAlbum);
router.post("/album/unlike", authMiddleware, validate(librarySchemas.unlikeAlbum), unlikeAlbum);
router.get("/album/list", authMiddleware, validate(librarySchemas.getLikedAlbums), getLikedAlbums);

export default router;
