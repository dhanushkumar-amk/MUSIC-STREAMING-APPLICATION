import Playlist from "../models/playlist.model.js";
import songModel from "../models/songModel.js";
import redis from "../config/redis.js";

const invalidateCache = userId =>
  redis.del(`cache:playlists:${userId}`);

/* ============================================================================
   EXISTING PLAYLIST CRUD FUNCTIONS (YOUR ORIGINAL CODE)
============================================================================ */

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

    if (!playlist.banner) {
      playlist.banner = song.image;
    }

    await playlist.save();
    await invalidateCache(req.userId);

    res.json({
      success: true,
      message: "Song added",
      banner: playlist.banner
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

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

    if (playlist.songs.length === 0) {
      playlist.banner = null;
    } else {
      const removedSong = await songModel.findById(songId);
      if (removedSong?.image && playlist.banner === removedSong.image) {
        playlist.banner = playlist.songs[0].image;
      }
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

/* ============================================================================
   NEW PLAYBACK FUNCTIONS (ADDED)
============================================================================ */

/* START PLAYLIST PLAYBACK → BUILDS QUEUE IN REDIS */
export const startPlaylistPlayback = async (req, res) => {
  try {
    const { playlistId } = req.body;

    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.userId
    });

    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    let songs = [...playlist.songs];

    if (playlist.shuffleEnabled) {
      songs = songs.sort(() => Math.random() - 0.5);
    }

    const queueObj = {
      queue: songs,
      currentIndex: 0,
      shuffle: playlist.shuffleEnabled,
      loopMode: playlist.loopMode,
      contextType: "playlist",
      contextId: playlistId
    };

    await redis.set(`queue:${req.userId}`, queueObj);

    res.json({ success: true, queue: queueObj });
  } catch (err) {
    console.error("start error:", err);
    res.status(500).json({ message: "Failed to start playback" });
  }
};

/* SHUFFLE TOGGLE */
export const togglePlaylistShuffle = async (req, res) => {
  try {
    const { playlistId } = req.body;

    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.userId
    });

    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    playlist.shuffleEnabled = !playlist.shuffleEnabled;
    await playlist.save();

    res.json({ success: true, shuffleEnabled: playlist.shuffleEnabled });
  } catch {
    res.status(500).json({ message: "Error toggling shuffle" });
  }
};

/* LOOP MODE */
export const updatePlaylistLoop = async (req, res) => {
  try {
    const { playlistId, loopMode } = req.body;

    if (!["off", "one", "all"].includes(loopMode))
      return res.status(400).json({ message: "Invalid loop mode" });

    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.userId
    });

    playlist.loopMode = loopMode;
    await playlist.save();

    res.json({ success: true, loopMode });
  } catch {
    res.status(500).json({ message: "Error updating loop" });
  }
};

/* PLAY NEXT */
export const playlistPlayNext = async (req, res) => {
  try {
    const { songId } = req.body;
    const key = `queue:${req.userId}`;

    const q = await redis.get(key);
    if (!q) return res.status(400).json({ message: "No queue" });

    q.queue.splice(q.currentIndex + 1, 0, songId);

    await redis.set(key, q);

    res.json({ success: true, queue: q.queue });
  } catch {
    res.status(500).json({ message: "Error play next" });
  }
};

/* ADD TO QUEUE (BOTTOM) */
export const playlistAddToQueue = async (req, res) => {
  try {
    const { songId } = req.body;

    const key = `queue:${req.userId}`;
    const q = await redis.get(key);

    if (!q)
      return res.status(400).json({ message: "No queue" });

    q.queue.push(songId);

    await redis.set(key, q);

    res.json({ success: true, queue: q.queue });
  } catch {
    res.status(500).json({ message: "Error adding to queue" });
  }
};
