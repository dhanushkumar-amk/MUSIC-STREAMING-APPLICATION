import songModel from "../models/songModel.js";
import redis from "../config/redis.js";

/* ---------------------------------------
   Track play count + unique listeners
----------------------------------------*/
export const incrementPlayCount = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.userId;

    const song = await songModel.findById(songId);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // Increment play count
    song.playCount += 1;

    // Track unique listener
    if (!song.uniqueListeners.includes(userId)) {
      song.uniqueListeners.push(userId);
    }

    await song.save();

    // Remove cached dashboard data
    await redis.del("admin:songStats");

    res.json({ success: true, message: "Play count updated" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating play count" });
  }
};

/* ---------------------------------------
   Admin: Get Song Stats Dashboard
----------------------------------------*/
export const getSongStats = async (req, res) => {
  try {
    const cacheKey = "admin:songStats";

    // Use Redis cache for fast admin dashboard
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, stats: cached, cached: true });
    }

    const songs = await songModel.find({}).sort({ playCount: -1 });

    const formatted = songs.map(song => ({
      id: song._id,
      name: song.name,
      playCount: song.playCount,
      uniqueListeners: song.uniqueListeners.length
    }));

    // Cache for 5 minutes
    await redis.set(cacheKey, formatted, { ex: 300 });

    res.json({ success: true, stats: formatted });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};
