import express from "express";
import validate from "../middleware/validate.middleware.js";
import { searchSchemas } from "../validators/misc.validator.js";
import { commonValidations } from "../middleware/validate.middleware.js";

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

router.get("/", validate(searchSchemas.search), globalSearch);
router.get("/autocomplete", validate(searchSchemas.autocomplete), autocompleteSearch);

// Recent searches (protected routes)
router.post("/recent", authMiddleware, saveRecentSearch);
router.get("/recent", authMiddleware, getRecentSearches);
router.delete("/recent", authMiddleware, clearRecentSearches);
router.delete("/recent/:searchId", authMiddleware, validate({ params: { searchId: commonValidations.mongoId } }), deleteRecentSearch);

export default router;
