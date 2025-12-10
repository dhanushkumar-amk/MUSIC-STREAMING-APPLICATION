import { cloudinary } from "../config/cloudinary.js";
import songModel from "../models/songModel.js";

/* ADD SONG */
export const addSong = async (req, res) => {
  try {
    const { name, desc, album } = req.body;
    const audioFile = req.files.audio?.[0];
    const imageFile = req.files.image?.[0];

    if (!audioFile || !imageFile)
      return res.status(400).json({ message: "Missing files" });

    /* Upload audio */
    const audioUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "video" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(audioFile.buffer);
    });

    /* Upload image */
    const imageUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(imageFile.buffer);
    });

    const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(
      audioUpload.duration % 60
    )}`;

    await songModel.create({
      name,
      desc,
      album,
      image: imageUpload.secure_url,
      file: audioUpload.secure_url,
      duration
    });

    res.json({ success: true, message: "Song added" });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

/* LIST SONG */
export const listSong = async (req, res) => {
  try {
    const songs = await songModel.find({}).lean();
    res.json({ success: true, songs });
  } catch {
    res.json({ success: false });
  }
};

/* REMOVE SONG */
export const removeSong = async (req, res) => {
  try {
    await songModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Song removed" });
  } catch {
    res.json({ success: false });
  }
};
