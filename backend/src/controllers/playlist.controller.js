import Playlist from "../models/playlist.model.js";
import songModel from "../models/songModel.js";
import redis from "../config/redis.js";

const invalidateCache = userId =>
  redis.del(`cache:playlists:${userId}`);

/* -----------------------------
   CREATE PLAYLIST
------------------------------*/
export const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;

    const playlist = await Playlist.create({
      userId: req.userId,
      name,
      banner: null,
      songs: []
    });

    await invalidateCache(req.userId);

    res.json({ success: true, playlist });
  } catch {
    res.status(500).json({ message: "Error creating playlist" });
  }
};

/* -----------------------------
   RENAME PLAYLIST
------------------------------*/
export const renamePlaylist = async (req, res) => {
  try {
    const { playlistId, newName } = req.body;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, userId: req.userId },
      { name: newName },
      { new: true }
    );

    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    await invalidateCache(req.userId);
    res.json({ success: true, playlist });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------
   DELETE PLAYLIST
------------------------------*/
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;

    await Playlist.findOneAndDelete({
      _id: playlistId,
      userId: req.userId
    });

    await invalidateCache(req.userId);
    res.json({ success: true, message: "Playlist deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------
   ADD SONG (SET FIRST BANNER)
------------------------------*/
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;

    const song = await songModel.findById(songId);
    if (!song)
      return res.status(404).json({ message: "Song not found" });

    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.userId
    });

    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
    }

    // FIRST SONG = BANNER
    if (!playlist.banner) {
      playlist.banner = song.image;
    }

    await playlist.save();
    await invalidateCache(req.userId);

    res.json({
      success: true,
      message: "Song added to playlist",
      banner: playlist.banner
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------
   REMOVE SONG (AUTO UPDATE BANNER)
------------------------------*/
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;

    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.userId
    }).populate("songs");

    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    playlist.songs = playlist.songs.filter(
      s => s._id.toString() !== songId
    );

    // UPDATE BANNER WHEN REMOVED

    if (playlist.songs.length === 0) {
      playlist.banner = null;
    } else if (
      playlist.banner &&
      playlist.banner === (await songModel.findById(songId))?.image
    ) {
      // Banner song removed → set new banner to second song
      const firstSong = playlist.songs[0];
      playlist.banner = firstSong.image;
    }

    await playlist.save();
    await invalidateCache(req.userId);

    res.json({
      success: true,
      message: "Song removed",
      banner: playlist.banner
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------
   LIST PLAYLISTS (CACHED)
------------------------------*/
export const getPlaylists = async (req, res) => {
  try {
    const key = `cache:playlists:${req.userId}`;

    const cached = await redis.get(key);
    if (cached)
      return res.json({ success: true, playlists: cached });

    const playlists = await Playlist.find({ userId: req.userId })
      .populate("songs");

    await redis.set(key, playlists, { ex: 300 });

    res.json({ success: true, playlists });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
