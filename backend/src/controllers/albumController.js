import { cloudinary } from "../config/cloudinary.js";
import albumModel from "../models/albumModel.js";

/* ADD ALBUM */
export const addAlbum = async (req, res) => {
  try {
    const { name, desc, bgColour } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "Album image missing" });

    const imageUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    await albumModel.create({
      name,
      desc,
      bgColour,
      image: imageUpload.secure_url
    });

    res.json({ success: true, message: "Album added" });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

/* LIST ALBUM */
export const listAlbum = async (req, res) => {
  try {
    const albums = await albumModel.find({}).lean();
    res.json({ success: true, albums });
  } catch {
    res.json({ success: false });
  }
};

/* REMOVE ALBUM */
export const removeAlbum = async (req, res) => {
  try {
    await albumModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Album removed" });
  } catch {
    res.json({ success: false });
  }
};
