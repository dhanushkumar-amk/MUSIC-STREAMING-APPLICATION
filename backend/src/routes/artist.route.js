import express from "express";
import multer from "multer";
import validate from "../middleware/validate.middleware.js";
import { artistSchemas } from "../validators/misc.validator.js";

import {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  followArtist,
  unfollowArtist,
  getFollowedArtists,
  getTopArtists,
  getFeaturedArtists,
  getArtistStats,
  searchArtists,
  getArtistsByGenre,
  getSimilarArtists
} from "../controllers/artist.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/* MULTER CONFIGURATION FOR IMAGE UPLOADS */
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* PUBLIC ROUTES */
router.get("/list", validate(artistSchemas.getAllArtists), getAllArtists);
router.get("/top", getTopArtists);
router.get("/featured", getFeaturedArtists);
router.get("/search", validate(artistSchemas.searchArtists), searchArtists);
router.get("/genre/:genre", validate(artistSchemas.getArtistsByGenre), getArtistsByGenre);
router.get("/:id/similar", validate(artistSchemas.getSimilarArtists), getSimilarArtists);
router.get("/:id/stats", getArtistStats);

/* ADMIN ROUTES - No Auth Required (Frontend handles password check) */
router.post(
  "/create",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  validate(artistSchemas.createArtist),
  createArtist
);

router.patch(
  "/:id/update",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  validate(artistSchemas.updateArtist),
  updateArtist
);

router.delete("/:id", validate(artistSchemas.deleteArtist), deleteArtist);

/* PROTECTED ROUTES - USER (Requires Auth) */
router.use(authMiddleware);

router.post("/:id/follow", validate(artistSchemas.followArtist), followArtist);
router.post("/:id/unfollow", validate(artistSchemas.unfollowArtist), unfollowArtist);
router.get("/me/following", getFollowedArtists);

// This must come last to avoid conflicts with other routes
router.get("/:id", validate(artistSchemas.getArtistById), getArtistById);

export default router;
