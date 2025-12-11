import RecentlyPlayed from "../models/recentlyPlayed.model.js";
import songModel from "../models/songModel.js";
import redis from "../config/redis.js";

/* ---------------------------------------
   TRACK SONG PLAY
----------------------------------------*/
export const trackPlay = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.userId;

    // Validate song
    const song = await songModel.findById(songId);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // Insert play event
    await RecentlyPlayed.create({ userId, songId });

    // DELETE CACHE FOR USER
    await redis.del(`recent:${userId}`);

    res.json({ success: true, message: "Play recorded" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to track song play" });
  }
};

/* ---------------------------------------
   GET RECENTLY PLAYED LIST
----------------------------------------*/
export const getRecentlyPlayed = async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `recent:${userId}`;

    // 1. Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, recent: cached, cached: true });
    }

    // 2. Fetch latest 50 from MongoDB
    const recentPlays = await RecentlyPlayed.find({ userId })
      .sort({ playedAt: -1 })
      .limit(30)
      .populate("songId");

    const formatted = recentPlays.map(item => ({
      id: item._id,
      playedAt: item.playedAt,
      song: item.songId
    }));

    // 3. Store in cache for 5 minutes
    await redis.set(cacheKey, formatted, { ex: 300 });

    res.json({ success: true, recent: formatted, cached: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch recently played songs" });
  }
};
