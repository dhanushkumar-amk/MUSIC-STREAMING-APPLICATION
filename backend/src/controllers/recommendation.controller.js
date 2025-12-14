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

    // 2. Recently Played - Get unique songs only
    const recentEntries = await RecentlyPlayed.find({ userId })
      .sort({ playedAt: -1 })
      .limit(50) // Get more entries to filter unique
      .populate("songId");

    // Filter to get unique songs (no duplicates)
    const seenSongIds = new Set();
    const recentlyPlayedSongs = [];

    for (const entry of recentEntries) {
      if (entry.songId && !seenSongIds.has(entry.songId._id.toString())) {
        seenSongIds.add(entry.songId._id.toString());
        recentlyPlayedSongs.push(entry.songId);
        if (recentlyPlayedSongs.length >= 10) break; // Limit to 10 unique songs
      }
    }

    // 3. Because You Listened (based on last played)
    let becauseYouListened = [];
    if (recentlyPlayedSongs.length > 0) {
      const lastSong = recentlyPlayedSongs[0];

      // Check if lastSong has album property
      if (lastSong && lastSong.album) {
        becauseYouListened = await songModel.find({
          album: lastSong.album,
          _id: { $ne: lastSong._id }
        }).limit(10);
      }
    }

    // If no "because you listened" songs, get random popular songs
    if (becauseYouListened.length === 0) {
      becauseYouListened = await songModel.find({}).limit(10);
    }

    // 4. Trending (based on weighted score)
    const trendingRaw = await Recommendation.find({})
      .sort({ weightedScore: -1 })
      .limit(20);

    const trending = await songModel.find({
      _id: { $in: trendingRaw.map(r => r.songId) }
    });

    // 5. Top Picks For You (if trending not enough, get random songs)
    let topPicks = trending.slice(0, 10);
    if (topPicks.length < 10) {
      const additionalSongs = await songModel.find({
        _id: { $nin: topPicks.map(s => s._id) }
      }).limit(10 - topPicks.length);
      topPicks = [...topPicks, ...additionalSongs];
    }

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
