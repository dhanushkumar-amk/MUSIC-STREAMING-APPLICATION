import express from "express";
import validate from "../middleware/validate.middleware.js";
import { statsSchemas } from "../validators/misc.validator.js";
import { getDashboardStats, getPlayStats } from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/dashboard", getDashboardStats);
router.get("/plays", validate(statsSchemas.getTopStats), getPlayStats);

export default router;
