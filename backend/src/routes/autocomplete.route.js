import express from "express";
import { autocompleteSearch } from "../controllers/autocomplete.controller.js";

const router = express.Router();

router.get("/", autocompleteSearch);

export default router;
