import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { incrementPlayCount, getSongStats } from "../controllers/playStats.controller.js";

const router = express.Router();

// User play count update
router.post("/play", authMiddleware, incrementPlayCount);

// Admin dashboard stats
router.get("/stats", getSongStats); // Optional: add admin middleware

export default router;
