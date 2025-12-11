import { meili } from "../config/meili.js";

export const autocompleteSearch = async (req, res) => {
  try {
    const q = req.query.q || "";

    if (q.length === 0) {
      return res.json({ success: true, suggestions: [] });
    }

    const songs = await meili.index("songs").search(q, {
      limit: 5,
      attributesToHighlight: ["name"]
    });

    const albums = await meili.index("albums").search(q, {
      limit: 5,
      attributesToHighlight: ["name"]
    });

    const users = await meili.index("users").search(q, {
      limit: 5,
      attributesToHighlight: ["email"]
    });

    res.json({
      success: true,
      suggestions: {
        songs: songs.hits,
        albums: albums.hits,
        users: users.hits
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};
