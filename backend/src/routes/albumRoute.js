import express from "express";
import upload from "../middleware/multer.js";

import {
  addAlbum,
  listAlbum,
  removeAlbum
} from "../controllers/albumController.js";

const albumRouter = express.Router();

albumRouter.post(
  "/add",
  upload.single("image"),
  addAlbum
);

albumRouter.get("/list", listAlbum);

albumRouter.post("/remove", removeAlbum);

export default albumRouter;
