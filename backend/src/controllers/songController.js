import { meili } from "../config/meili.js";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { r2 } from "../config/r2.js";
import songModel from "../models/songModel.js";

const addSong = async (req, res) => {
  try {
    console.log("CONTROLLER FILES:", req.files);

    // VALIDATE FILES
    if (!req.files || !req.files.audio || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "Audio and image files are required (fields: audio, image)"
      });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    const { name, desc, album } = req.body;
    if (!name || !desc || !album) {
      return res.status(400).json({
        success: false,
        message: "Fields required: name, desc, album"
      });
    }

    // BUILD KEYS
    const audioKey = `audio/${Date.now()}-${audioFile.originalname}`;
    const imageKey = `images/${Date.now()}-${imageFile.originalname}`;

    // UPLOAD AUDIO
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: audioKey,
        Body: fs.createReadStream(audioFile.path),
        ContentType: audioFile.mimetype,
      })
    );

    // UPLOAD IMAGE
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: imageKey,
        Body: fs.createReadStream(imageFile.path),
        ContentType: imageFile.mimetype,
      })
    );

    // PUBLIC URLS
    const audioUrl = `${process.env.R2_PUBLIC_URL}/${audioKey}`;
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${imageKey}`;

    const song = await songModel.create({
      name,
      desc,
      album,
      image: imageUrl,
      file: audioUrl,
      duration: "0:00"
    });

    res.json({ success: true, message: "Song Added Successfully", song });

  } catch (error) {
    console.error("ADD SONG ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


const listSong = async (req, res) => {
  try {
    const allSongs = await songModel.find({});
    res.json({ success: true, songs: allSongs });
  } catch (error) {
    res.json({ success: false });
  }
}


const removeSong = async (req, res) => {
  try {
    const id = req.body.id;

    await songModel.findByIdAndDelete(id);

    // === DELETE FROM MEILI ===
    await meili.index("songs").deleteDocument(id);

    res.json({ success: true, message: "Song Removed" });

  } catch (error) {
    res.json({ success: false });
  }
}

export { addSong, listSong, removeSong }
