import { v2 as cloudinary } from 'cloudinary'
import albumModel from '../models/albumModel.js';
import { meili } from "../config/meili.js";

const addAlbum = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const bgColour = req.body.bgColour;

    const imageFile = req.file;
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

    const albumData = {
      name,
      desc,
      bgColour,
      image: imageUpload.secure_url
    };

    const album = new albumModel(albumData);
    await album.save();

    // === INDEX TO MEILI ===
    try {
      await meili.index("albums").addDocuments([
        {
          id: album._id.toString(),
          name,
          desc,
          image: imageUpload.secure_url
        }
      ]);
    } catch (meiliError) {
      console.log("MeiliSearch indexing skipped:", meiliError.message);
    }

    res.json({ success: true, message: "Album Added", album });

  } catch (error) {
    console.error("Error adding album:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to add album" });
  }
}


const listAlbum = async (req, res) => {
  try {
    const allAlbums = await albumModel.find({});
    res.json({ success: true, albums: allAlbums });
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ success: false, message: "Error fetching albums" });
  }
}


const removeAlbum = async (req, res) => {
  try {
    const id = req.body.id;

    await albumModel.findByIdAndDelete(id);

    // === DELETE FROM MEILI ===
    try {
      await meili.index("albums").deleteDocument(id);
    } catch (meiliError) {
      console.log("MeiliSearch delete skipped:", meiliError.message);
    }

    res.json({ success: true, message: "Album Removed" });

  } catch (error) {
    console.error("Error removing album:", error);
    res.status(500).json({ success: false, message: "Failed to remove album" });
  }
}

export { addAlbum, listAlbum, removeAlbum }
