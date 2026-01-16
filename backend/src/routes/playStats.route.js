import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { statsSchemas } from "../validators/misc.validator.js";
import { incrementPlayCount, getSongStats } from "../controllers/playStats.controller.js";

const router = express.Router();

// User play count update
router.post("/play", authMiddleware, validate(statsSchemas.recordPlay), incrementPlayCount);

// Admin dashboard stats
router.get("/stats", validate(statsSchemas.getTopStats), getSongStats); // Optional: add admin middleware

export default router;
