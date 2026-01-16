import express from "express";
import upload from "../middleware/multer.js";
import validate from "../middleware/validate.middleware.js";
import { albumSchemas } from "../validators/media.validator.js";

import {
  addAlbum,
  listAlbum,
  removeAlbum
} from "../controllers/albumController.js";

const albumRouter = express.Router();

albumRouter.post(
  "/add",
  upload.single("image"),
  validate(albumSchemas.addAlbum),
  addAlbum
);

albumRouter.get("/list", validate(albumSchemas.listAlbum), listAlbum);

albumRouter.post("/remove", validate(albumSchemas.removeAlbum), removeAlbum);

export default albumRouter;
