import { meili } from "../config/meili.js";
import Song from "../models/songModel.js";
import Album from "../models/albumModel.js";
import User from "../models/user.model.js";
import RecentSearch from "../models/recentSearch.model.js";
import redis from "../config/redis.js";

export const globalSearch = async (req, res) => {
  try {
    const q = req.query.q || "";

    if (!q) {
      return res.json({
        success: true,
        results: {
          songs: [],
          albums: [],
          users: []
        }
      });
    }

    try {
      // Try MeiliSearch first
      const [songs, albums, users] = await Promise.all([
        meili.index("songs").search(q, { limit: 10 }),
        meili.index("albums").search(q, { limit: 10 }),
        meili.index("users").search(q, { limit: 10 })
      ]);

      res.json({
        success: true,
        results: {
          songs: songs.hits,
          albums: albums.hits,
          users: users.hits
        }
      });
    } catch (meiliError) {
      // Fallback to MongoDB search if MeiliSearch fails
      console.log("MeiliSearch unavailable, using MongoDB fallback");

      const searchRegex = new RegExp(q, 'i');

      const [songs, albums, users] = await Promise.all([
        Song.find({
          $or: [
            { name: searchRegex },
            { artist: searchRegex },
            { desc: searchRegex }
          ]
        }).limit(10).select('_id name desc artist image file duration'),

        Album.find({
          $or: [
            { name: searchRegex },
            { desc: searchRegex }
          ]
        }).limit(10).select('_id name desc image bgColour'),

        User.find({
          email: searchRegex
        }).limit(10).select('_id email avatar')
      ]);

      // Format to match MeiliSearch response
      res.json({
        success: true,
        results: {
          songs: songs.map(s => ({
            id: s._id.toString(),
            name: s.name,
            desc: s.desc,
            artist: s.artist,
            image: s.image,
            file: s.file,
            duration: s.duration
          })),
          albums: albums.map(a => ({
            id: a._id.toString(),
            name: a.name,
            desc: a.desc,
            image: a.image,
            bgColour: a.bgColour
          })),
          users: users.map(u => ({
            id: u._id.toString(),
            email: u.email,
            avatar: u.avatar
          }))
        }
      });
    }

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, error: "Search failed" });
  }
};

export const autocompleteSearch = async (req, res) => {
  try {
    const q = req.query.q || "";

    if (!q) {
      return res.json({
        success: true,
        suggestions: {
          songs: [],
          albums: [],
          users: []
        }
      });
    }

    try {
      // Try MeiliSearch first
      const [songs, albums, users] = await Promise.all([
        meili.index("songs").search(q, { limit: 5 }),
        meili.index("albums").search(q, { limit: 5 }),
        meili.index("users").search(q, { limit: 5 })
      ]);

      res.json({
        success: true,
        suggestions: {
          songs: songs.hits,
          albums: albums.hits,
          users: users.hits
        }
      });
    } catch (meiliError) {
      // Fallback to MongoDB
      const searchRegex = new RegExp(q, 'i');

      const [songs, albums, users] = await Promise.all([
        Song.find({
          $or: [
            { name: searchRegex },
            { artist: searchRegex }
          ]
        }).limit(5).select('_id name artist image'),

        Album.find({
          name: searchRegex
        }).limit(5).select('_id name image'),

        User.find({
          email: searchRegex
        }).limit(5).select('_id email')
      ]);

      res.json({
        success: true,
        suggestions: {
          songs: songs.map(s => ({
            id: s._id.toString(),
            name: s.name,
            artist: s.artist,
            image: s.image
          })),
          albums: albums.map(a => ({
            id: a._id.toString(),
            name: a.name,
            image: a.image
          })),
          users: users.map(u => ({
            id: u._id.toString(),
            email: u.email
          }))
        }
      });
    }

  } catch (err) {
    console.error("Autocomplete error:", err);
    res.status(500).json({ success: false, error: "Autocomplete failed" });
  }
};

/* ---------------------------------------
   SAVE RECENT SEARCH
----------------------------------------*/
export const saveRecentSearch = async (req, res) => {
  try {
    const userId = req.userId;
    const { query, type = 'query', resultId = null } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    // Save search
    await RecentSearch.create({
      userId,
      query: query.trim(),
      type,
      resultId
    });

    // Invalidate cache
    await redis.del(`recent-searches:${userId}`);

    res.json({ success: true, message: "Search saved" });
  } catch (err) {
    console.error("Save recent search error:", err);
    res.status(500).json({ success: false, error: "Failed to save search" });
  }
};

/* ---------------------------------------
   GET RECENT SEARCHES
----------------------------------------*/
export const getRecentSearches = async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `recent-searches:${userId}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, searches: cached, cached: true });
    }

    // Get unique recent searches (last 10)
    const searches = await RecentSearch.find({ userId })
      .sort({ searchedAt: -1 })
      .limit(20)
      .select('query type resultId searchedAt');

    // Remove duplicates based on query
    const uniqueSearches = [];
    const seenQueries = new Set();

    for (const search of searches) {
      if (!seenQueries.has(search.query.toLowerCase())) {
        seenQueries.add(search.query.toLowerCase());
        uniqueSearches.push(search);
        if (uniqueSearches.length >= 10) break;
      }
    }

    // Cache for 5 minutes
    await redis.set(cacheKey, uniqueSearches, { ex: 300 });

    res.json({ success: true, searches: uniqueSearches, cached: false });
  } catch (err) {
    console.error("Get recent searches error:", err);
    res.status(500).json({ success: false, error: "Failed to get recent searches" });
  }
};

/* ---------------------------------------
   CLEAR RECENT SEARCHES
----------------------------------------*/
export const clearRecentSearches = async (req, res) => {
  try {
    const userId = req.userId;

    await RecentSearch.deleteMany({ userId });
    await redis.del(`recent-searches:${userId}`);

    res.json({ success: true, message: "Recent searches cleared" });
  } catch (err) {
    console.error("Clear recent searches error:", err);
    res.status(500).json({ success: false, error: "Failed to clear searches" });
  }
};

/* ---------------------------------------
   DELETE SINGLE RECENT SEARCH
----------------------------------------*/
export const deleteRecentSearch = async (req, res) => {
  try {
    const userId = req.userId;
    const { searchId } = req.params;

    await RecentSearch.findOneAndDelete({ _id: searchId, userId });
    await redis.del(`recent-searches:${userId}`);

    res.json({ success: true, message: "Search deleted" });
  } catch (err) {
    console.error("Delete recent search error:", err);
    res.status(500).json({ success: false, error: "Failed to delete search" });
  }
};
