import { meili } from "../config/meili.js"

export const globalSearch = async (req, res) => {
  try {
    const q = req.query.q || "";

    const songs = await meili.index("songs").search(q);
    const albums = await meili.index("albums").search(q);
    const users = await meili.index("users").search(q);

    res.json({
      success: true,
      results: {
        songs: songs.hits,
        albums: albums.hits,
        users: users.hits
      }
    });

  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, error: "Search failed" });
  }
};
