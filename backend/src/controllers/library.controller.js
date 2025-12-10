import Library from "../models/library.model.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import redis from "../config/redis.js";   // caching layer

/* ---------------------------------------
   INIT USER LIBRARY IF NOT EXISTS
----------------------------------------*/
const ensureLibrary = async userId => {
  let lib = await Library.findOne({ userId });
  if (!lib) {
    lib = await Library.create({ userId, likedSongs: [], likedAlbums: [] });
  }
  return lib;
};

/* ---------------------------------------
   INVALIDATE CACHE HELPERS
----------------------------------------*/
const invalidateSongCache = userId =>
  redis.del(`cache:likedSongs:${userId}`);

const invalidateAlbumCache = userId =>
  redis.del(`cache:likedAlbums:${userId}`);

/* ---------------------------------------
   LIKE SONG
----------------------------------------*/
export const likeSong = async (req, res) => {
  try {
    const { songId } = req.body;

    const song = await songModel.findById(songId);
    if (!song)
      return res.status(404).json({ message: "Song not found" });

    const lib = await ensureLibrary(req.userId);

    if (!lib.likedSongs.includes(songId)) {
      lib.likedSongs.push(songId);
      await lib.save();
      await invalidateSongCache(req.userId);
    }

    res.json({ success: true, message: "Song liked" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------
   UNLIKE SONG
----------------------------------------*/
export const unlikeSong = async (req, res) => {
  try {
    const { songId } = req.body;

    const lib = await ensureLibrary(req.userId);

    lib.likedSongs = lib.likedSongs.filter(id => id.toString() !== songId);
    await lib.save();

    await invalidateSongCache(req.userId);

    res.json({ success: true, message: "Song unliked" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------
   GET LIKED SONGS (WITH CACHING)
----------------------------------------*/
export const getLikedSongs = async (req, res) => {
  try {
    const cacheKey = `cache:likedSongs:${req.userId}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, songs: cached });
    }

    const lib = await ensureLibrary(req.userId);

    const songs = await songModel.find({
      _id: { $in: lib.likedSongs }
    });

    await redis.set(cacheKey, songs, { ex: 300 }); // cache 5 min

    res.json({ success: true, songs });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------
   LIKE ALBUM
----------------------------------------*/
export const likeAlbum = async (req, res) => {
  try {
    const { albumId } = req.body;

    const album = await albumModel.findById(albumId);
    if (!album)
      return res.status(404).json({ message: "Album not found" });

    const lib = await ensureLibrary(req.userId);

    if (!lib.likedAlbums.includes(albumId)) {
      lib.likedAlbums.push(albumId);
      await lib.save();
      await invalidateAlbumCache(req.userId);
    }

    res.json({ success: true, message: "Album liked" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------
   UNLIKE ALBUM
----------------------------------------*/
export const unlikeAlbum = async (req, res) => {
  try {
    const { albumId } = req.body;

    const lib = await ensureLibrary(req.userId);

    lib.likedAlbums = lib.likedAlbums.filter(id => id.toString() !== albumId);
    await lib.save();

    await invalidateAlbumCache(req.userId);

    res.json({ success: true, message: "Album unliked" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------
   GET LIKED ALBUMS (WITH CACHING)
----------------------------------------*/
export const getLikedAlbums = async (req, res) => {
  try {
    const cacheKey = `cache:likedAlbums:${req.userId}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, albums: cached });
    }

    const lib = await ensureLibrary(req.userId);

    const albums = await albumModel.find({
      _id: { $in: lib.likedAlbums }
    });

    await redis.set(cacheKey, albums, { ex: 300 }); // cache 5 min

    res.json({ success: true, albums });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
