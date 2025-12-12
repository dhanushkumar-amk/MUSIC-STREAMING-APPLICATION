import RecentlyPlayed from "../models/recentlyPlayed.model.js";
import songModel from "../models/songModel.js";
import redis from "../config/redis.js";
import Recommendation from "../models/recommendation.model.js";


/* ---------------------------------------
   START PLAY SESSION → returns entryId
----------------------------------------*/
export const trackStart = async (req, res) => {
  try {
    const { songId, contextType = null, contextId = null } = req.body;
    const userId = req.userId;

    // Validate song existence
    const song = await songModel.findById(songId);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // Create a new playback session entry
    const entry = await RecentlyPlayed.create({
      userId,
      songId,
      contextType,
      contextId
    });

    // Invalidate user cache
    await redis.del(`recent:${userId}`);

    return res.json({ success: true, entryId: entry._id });
  } catch (err) {
    console.error("trackStart error:", err);
    res.status(500).json({ message: "Failed to start play session" });
  }
};

/* ---------------------------------------
   END PLAY SESSION → save duration / skipped
----------------------------------------*/
export const trackEnd = async (req, res) => {
  try {
    const { entryId, playDuration = 0, skipped = false } = req.body;
    const userId = req.userId;

    const entry = await RecentlyPlayed.findById(entryId);
    if (!entry)
      return res.status(404).json({ message: "Entry not found" });

    if (entry.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 1. Update session
    entry.playDuration = playDuration;
    entry.skipped = skipped;
    await entry.save();

    // 2. Invalidate cache
    await redis.del(`recent:${userId}`);

    // 3. UPDATE RECOMMENDATION TABLE
    let rec = await Recommendation.findOne({ songId: entry.songId });

    if (!rec) {
      rec = await Recommendation.create({ songId: entry.songId });
    }

    if (skipped) {
      rec.globalSkipCount += 1;
    } else {
      rec.globalPlayCount += 1;
    }

    // Weighted score (you can adjust formula later)
    rec.weightedScore = rec.globalPlayCount - rec.globalSkipCount * 0.5;

    await rec.save();

    return res.json({ success: true, message: "Session ended" });
  } catch (err) {
    console.error("trackEnd error:", err);
    res.status(500).json({ message: "Failed to end play session" });
  }
};


/* ---------------------------------------
   GET RECENTLY PLAYED LIST
----------------------------------------*/
export const getRecentlyPlayed = async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `recent:${userId}`;

    // 1. Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        recent: cached,
        cached: true
      });
    }

    // 2. DB Lookup (latest 30)
    const recentPlays = await RecentlyPlayed.find({ userId })
      .sort({ playedAt: -1 })
      .limit(30)
      .populate("songId");

    const formatted = recentPlays.map((item) => ({
      id: item._id,
      playedAt: item.playedAt,
      song: item.songId,
      playDuration: item.playDuration,
      skipped: item.skipped,
      contextType: item.contextType,
      contextId: item.contextId
    }));

    // 3. Cache for 5 minutes
    await redis.set(cacheKey, formatted, { ex: 300 });

    return res.json({
      success: true,
      recent: formatted,
      cached: false
    });
  } catch (err) {
    console.error("getRecentlyPlayed error:", err);
    res.status(500).json({
      message: "Failed to fetch recently played songs"
    });
  }
};
