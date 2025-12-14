import express from "express";
import {
  globalSearch,
  autocompleteSearch,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  deleteRecentSearch
} from "../controllers/search.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", globalSearch);
router.get("/autocomplete", autocompleteSearch);

// Recent searches (protected routes)
router.post("/recent", authMiddleware, saveRecentSearch);
router.get("/recent", authMiddleware, getRecentSearches);
router.delete("/recent", authMiddleware, clearRecentSearches);
router.delete("/recent/:searchId", authMiddleware, deleteRecentSearch);

export default router;
