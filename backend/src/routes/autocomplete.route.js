import express from "express";
import validate from "../middleware/validate.middleware.js";
import { searchSchemas } from "../validators/misc.validator.js";
import { autocompleteSearch } from "../controllers/autocomplete.controller.js";

const router = express.Router();

router.get("/", validate(searchSchemas.autocomplete), autocompleteSearch);

export default router;
