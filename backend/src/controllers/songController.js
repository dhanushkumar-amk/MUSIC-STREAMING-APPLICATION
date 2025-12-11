import { v2 as cloudinary } from 'cloudinary'
import songModel from '../models/songModel.js';
import { meili } from "../config/meili.js";

const addSong = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const album = req.body.album;

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    const audioUpload = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" });
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

    const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`;

    const songData = {
      name,
      desc,
      album,
      image: imageUpload.secure_url,
      file: audioUpload.secure_url,
      duration
    };

    const song = new songModel(songData);
    await song.save();

    // === INDEX TO MEILISEARCH ===
    await meili.index("songs").addDocuments([
      {
        id: song._id.toString(),
        name,
        desc,
        album,
        image: imageUpload.secure_url
      }
    ]);

    res.json({ success: true, message: "Song Added", song });

  } catch (error) {
    console.log(error)
    res.json({ success: false });
  }
}


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
