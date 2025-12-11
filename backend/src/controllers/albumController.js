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
    await meili.index("albums").addDocuments([
      {
        id: album._id.toString(),
        name,
        desc,
        image: imageUpload.secure_url
      }
    ]);

    res.json({ success: true, message: "Album Added", album });

  } catch (error) {
    res.json({ success: false });
  }
}


const listAlbum = async (req, res) => {
  try {
    const allAlbums = await albumModel.find({});
    res.json({ success: true, albums: allAlbums });
  } catch (error) {
    res.json({ success: false });
  }
}


const removeAlbum = async (req, res) => {
  try {
    const id = req.body.id;

    await albumModel.findByIdAndDelete(id);

    // === DELETE FROM MEILI ===
    await meili.index("albums").deleteDocument(id);

    res.json({ success: true, message: "Album Removed" });

  } catch (error) {
    res.json({ success: false });
  }
}

export { addAlbum, listAlbum, removeAlbum }
