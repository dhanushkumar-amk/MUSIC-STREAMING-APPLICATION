import { meili } from "../config/meili.js";
import Song from "../models/songModel.js";
import Album from "../models/albumModel.js";
import User from "../models/user.model.js";

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
