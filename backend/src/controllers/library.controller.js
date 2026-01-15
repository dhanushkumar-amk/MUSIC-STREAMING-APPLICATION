import prisma from "../config/database.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import redis from "../config/redis.js";   // caching layer

/* ---------------------------------------
   INIT USER LIBRARY IF NOT EXISTS
----------------------------------------*/
const ensureLibrary = async userId => {
  let lib = await prisma.library.findUnique({ where: { userId } });
  if (!lib) {
    lib = await prisma.library.create({
      data: {
        userId,
        likedSongIds: [],
        likedAlbumIds: []
      }
    });
  }
  return lib;
};

/* ---------------------------------------
   INVALIDATE CACHE HELPERS
----------------------------------------*/
const invalidateSongCache = async userId => {
  if (redis) {
    try {
      await redis.del(`cache:likedSongs:${userId}`);
    } catch (err) {
      console.warn('Redis delete failed:', err.message);
    }
  }
};

const invalidateAlbumCache = async userId => {
  if (redis) {
    try {
      await redis.del(`cache:likedAlbums:${userId}`);
    } catch (err) {
      console.warn('Redis delete failed:', err.message);
    }
  }
};

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

    if (!lib.likedSongIds.includes(songId)) {
      await prisma.library.update({
        where: { userId: req.userId },
        data: {
          likedSongIds: {
            push: songId
          }
        }
      });
      await invalidateSongCache(req.userId);
    }

    res.json({ success: true, message: "Song liked" });
  } catch (error) {
    console.error("Like song error:", error);
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

    const updatedSongIds = lib.likedSongIds.filter(id => id !== songId);

    await prisma.library.update({
      where: { userId: req.userId },
      data: {
        likedSongIds: updatedSongIds
      }
    });

    await invalidateSongCache(req.userId);

    res.json({ success: true, message: "Song unliked" });
  } catch (error) {
    console.error("Unlike song error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------
   GET LIKED SONGS (WITH CACHING)
----------------------------------------*/
export const getLikedSongs = async (req, res) => {
  try {
    const cacheKey = `cache:likedSongs:${req.userId}`;

    // Try cache only if Redis is available
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.json({ success: true, songs: cached });
        }
      } catch (err) {
        console.warn('Redis get failed:', err.message);
      }
    }

    const lib = await ensureLibrary(req.userId);

    const songs = await songModel.find({
      _id: { $in: lib.likedSongIds }
    });

    // Try to cache only if Redis is available
    if (redis) {
      try {
        await redis.set(cacheKey, songs, { ex: 300 }); // cache 5 min
      } catch (err) {
        console.warn('Redis set failed:', err.message);
      }
    }

    res.json({ success: true, songs });
  } catch (error) {
    console.error("Get liked songs error:", error);
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

    if (!lib.likedAlbumIds.includes(albumId)) {
      await prisma.library.update({
        where: { userId: req.userId },
        data: {
          likedAlbumIds: {
            push: albumId
          }
        }
      });
      await invalidateAlbumCache(req.userId);
    }

    res.json({ success: true, message: "Album liked" });
  } catch (error) {
    console.error("Like album error:", error);
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

    const updatedAlbumIds = lib.likedAlbumIds.filter(id => id !== albumId);

    await prisma.library.update({
      where: { userId: req.userId },
      data: {
        likedAlbumIds: updatedAlbumIds
      }
    });

    await invalidateAlbumCache(req.userId);

    res.json({ success: true, message: "Album unliked" });
  } catch (error) {
    console.error("Unlike album error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------
   GET LIKED ALBUMS (WITH CACHING)
----------------------------------------*/
export const getLikedAlbums = async (req, res) => {
  try {
    const cacheKey = `cache:likedAlbums:${req.userId}`;

    // Try cache only if Redis is available
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.json({ success: true, albums: cached });
        }
      } catch (err) {
        console.warn('Redis get failed:', err.message);
      }
    }

    const lib = await ensureLibrary(req.userId);

    const albums = await albumModel.find({
      _id: { $in: lib.likedAlbumIds }
    });

    // Try to cache only if Redis is available
    if (redis) {
      try {
        await redis.set(cacheKey, albums, { ex: 300 }); // cache 5 min
      } catch (err) {
        console.warn('Redis set failed:', err.message);
      }
    }

    res.json({ success: true, albums });
  } catch (error) {
    console.error("Get liked albums error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
