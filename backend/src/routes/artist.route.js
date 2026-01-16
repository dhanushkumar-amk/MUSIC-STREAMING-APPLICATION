import express from "express";
import multer from "multer";
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
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* PUBLIC ROUTES */
router.get("/list", getAllArtists);
router.get("/top", getTopArtists);
router.get("/featured", getFeaturedArtists);
router.get("/search", searchArtists);
router.get("/genre/:genre", getArtistsByGenre);
router.get("/:id", getArtistById);
router.get("/:id/similar", getSimilarArtists);

/* PROTECTED ROUTES - USER */
router.use(authMiddleware);

router.post("/:id/follow", followArtist);
router.post("/:id/unfollow", unfollowArtist);
router.get("/me/following", getFollowedArtists);

/* ADMIN ROUTES - Artist Management */
router.post(
  "/create",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  createArtist
);

router.patch(
  "/:id/update",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  updateArtist
);

router.delete("/:id", deleteArtist);
router.get("/:id/stats", getArtistStats);

export default router;
