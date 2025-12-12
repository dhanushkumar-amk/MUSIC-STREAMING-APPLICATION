import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getHomeFeed } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.get("/home", authMiddleware, getHomeFeed);

export default router;
