import { v2 as cloudinary } from 'cloudinary';
import songModel from '../models/songModel.js';
import { meili } from "../config/meili.js";
import redis from "../config/redis.js";

/* ADD SONG */
const addSong = async (req, res) => {
    try {
        const name = req.body.name;
        const desc = req.body.desc;
        const album = req.body.album;
        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];

        const audioUpload = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" });
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

        const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60).toString().padStart(2, "0")}`;

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

        // Add to MeiliSearch
        await meili.index("songs").addDocuments([{
            id: song._id.toString(),
            name,
            desc,
            artist: desc, // Using desc as artist for simple mapping
            image: imageUpload.secure_url,
            duration
        }]);

        // Clear cache
        await redis.del("songs:all");

        res.json({ success: true, message: "Song Added", song });

    } catch (error) {
        console.error("Error adding song:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to add song" });
    }
}

/* LIST SONGS (Cached) */
const listSong = async (req, res) => {
    try {
        // Check cache
        const cached = await redis.get("songs:all");
        if(cached) {
            // Parse if it's a string
            const songs = typeof cached === 'string' ? JSON.parse(cached) : cached;
            return res.json({ success: true, songs });
        }

        const allSongs = await songModel.find({});

        // Set cache (5 mins)
        await redis.set("songs:all", JSON.stringify(allSongs), { ex: 300 });

        res.json({ success: true, songs: allSongs });
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ success: false, message: "Error fetching songs" });
    }
}

/* REMOVE SONG */
const removeSong = async (req, res) => {
    try {
        await songModel.findByIdAndDelete(req.body.id);

        // Remove from Meili
        try {
            await meili.index("songs").deleteDocument(req.body.id);
        } catch (e) {
            console.log("Meili delete skipped");
        }

        // Clear cache
        await redis.del("songs:all");

        res.json({ success: true, message: "Song Removed" });
    } catch (error) {
        console.error("Error removing song:", error);
        res.status(500).json({ success: false, message: "Failed to remove song" });
    }
}

export { addSong, listSong, removeSong }
