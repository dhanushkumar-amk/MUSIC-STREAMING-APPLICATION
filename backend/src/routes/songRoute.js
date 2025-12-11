import express from "express";
import upload from "../middleware/multer.js";
import { addSong, listSong, removeSong } from "../controllers/songController.js";

const songRouter = express.Router();

songRouter.post(
  "/add",

  // DEBUG: BEFORE MULTER
  (req, res, next) => {
    console.log("DEBUG BEFORE MULTER → BODY:", req.body);
    next();
  },

  // MULTER HANDLER
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 }
  ]),

  // DEBUG: AFTER MULTER
  (req, res, next) => {
    console.log("DEBUG AFTER MULTER → FILES:", req.files);
    next();
  },

  // CONTROLLER
  addSong
);

songRouter.get("/list", listSong);
songRouter.post("/remove", removeSong);

export default songRouter;
