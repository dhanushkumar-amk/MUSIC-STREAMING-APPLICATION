import RecentlyPlayed from "../models/recentlyPlayed.model.js";
import Recommendation from "../models/recommendation.model.js";
import songModel from "../models/songModel.js";
import redis from "../config/redis.js";

/* ---------------------------------------
   HOME FEED RECOMMENDATIONS
----------------------------------------*/
export const getHomeFeed = async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `feed:${userId}`;

    // 1. Check Redis Cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, feed: cached, cached: true });
    }

    // 2. Recently Played
    const recent = await RecentlyPlayed.find({ userId })
      .sort({ playedAt: -1 })
      .limit(10)
      .populate("songId");

    const recentlyPlayedSongs = recent.map(r => r.songId);

    // 3. Because You Listened (based on last played)
    let becauseYouListened = [];
    if (recentlyPlayedSongs.length > 0) {
      const lastSong = recentlyPlayedSongs[0];

      becauseYouListened = await songModel.find({
        album: lastSong.album,
        _id: { $ne: lastSong._id }
      }).limit(10);
    }

    // 4. Trending (based on weighted score)
    const trendingRaw = await Recommendation.find({})
      .sort({ weightedScore: -1 })
      .limit(20);

    const trending = await songModel.find({
      _id: trendingRaw.map(r => r.songId)
    });

    // 5. Top Picks For You (if trending not enough)
    const topPicks = trending.slice(0, 10);

    // FINAL FEED RESPONSE
    const feed = {
      recentlyPlayed: recentlyPlayedSongs,
      becauseYouListened,
      trendingNow: trending,
      topPicksForYou: topPicks
    };

    // Cache feed for 5 minutes
    await redis.set(cacheKey, feed, { ex: 300 });

    return res.json({ success: true, feed, cached: false });
  } catch (err) {
    console.error("getHomeFeed error:", err);
    res.status(500).json({ message: "Failed to get feed" });
  }
};
