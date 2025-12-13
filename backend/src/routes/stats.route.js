import express from "express";
import { getDashboardStats, getPlayStats } from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/dashboard", getDashboardStats);
router.get("/plays", getPlayStats);

export default router;
