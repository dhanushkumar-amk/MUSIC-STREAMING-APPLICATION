import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";

const addSong = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const album = req.body.album;

    if (!req.files || !req.files.audio || !req.files.image) {
      return res.json({ success: false, message: "Audio & Image are required" });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video"
    });

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image"
    });

    const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(
      audioUpload.duration % 60
    )}`;

    const song = new songModel({
      name,
      desc,
      album,
      image: imageUpload.secure_url,
      file: audioUpload.secure_url,
      duration
    });

    await song.save();

    res.json({ success: true, message: "Song Added", song });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

const listSong = async (req, res) => {
  try {
    const allSongs = await songModel.find({});
    res.json({ success: true, songs: allSongs });
  } catch (error) {
    res.json({ success: false });
  }
};

const removeSong = async (req, res) => {
  try {
    const id = req.body.id;
    await songModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Song Removed" });
  } catch (error) {
    res.json({ success: false });
  }
};

export { addSong, listSong, removeSong };
