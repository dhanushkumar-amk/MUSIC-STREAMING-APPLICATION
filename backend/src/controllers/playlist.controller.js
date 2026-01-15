import prisma from "../config/database.js";
import Song from "../models/songModel.js";
import redis from "../config/redis.js";
import { safeRedisGet, safeRedisSet, safeRedisDel } from "../utils/redisHelpers.js";

/* CREATE PLAYLIST */
export const createPlaylist = async (req, res) => {
  try {
    const { name, desc = "", isPublic = false } = req.body;
    const userId = req.userId;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Playlist name is required" });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        desc: desc.trim(),
        userId,
        isPublic,
        songIds: []
      }
    });

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({ success: true, playlist, message: "Playlist created successfully" });

  } catch (error) {
    console.error("Create playlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* GET USER PLAYLISTS */
export const getPlaylists = async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `playlists:${userId}`;

    // Check cache
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return res.json({ success: true, playlists: cached, cached: true });
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Populate songs for each playlist
    const playlistsWithSongs = await Promise.all(
      playlists.map(async (playlist) => {
        const songs = await Song.find({ _id: { $in: playlist.songIds } });
        return { ...playlist, songs };
      })
    );

    // Cache for 5 minutes
    await safeRedisSet(cacheKey, playlistsWithSongs, { ex: 300 });

    res.json({ success: true, playlists: playlistsWithSongs, cached: false });

  } catch (error) {
    console.error("Get playlists error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* GET SINGLE PLAYLIST */
export const getPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.userId;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            avatar: true
          }
        },
        collaborators: {
          select: {
            id: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    // Check access rights
    const isOwner = playlist.userId === userId;
    const isCollaborator = playlist.collaborators.some(c => c.id === userId);
    const canAccess = isOwner || isCollaborator || playlist.isPublic;

    if (!canAccess) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Populate songs
    const songs = await Song.find({ _id: { $in: playlist.songIds } });
    const playlistWithSongs = { ...playlist, songs };

    res.json({ success: true, playlist: playlistWithSongs, isOwner, isCollaborator });

  } catch (error) {
    console.error("Get playlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* UPDATE PLAYLIST */
export const updatePlaylist = async (req, res) => {
  try {
    const { playlistId, name, desc, isPublic, banner } = req.body;
    const userId = req.userId;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (desc !== undefined) updateData.desc = desc.trim();
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (banner !== undefined) updateData.banner = banner;

    const playlist = await prisma.playlist.updateMany({
      where: {
        id: playlistId,
        userId
      },
      data: updateData
    });

    if (playlist.count === 0) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    // Fetch updated playlist with songs
    const updatedPlaylist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    const songs = await Song.find({ _id: { $in: updatedPlaylist.songIds } });
    const playlistWithSongs = { ...updatedPlaylist, songs };

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({ success: true, playlist: playlistWithSongs, message: "Playlist updated successfully" });
  } catch (error) {
    console.error("Update playlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* RENAME PLAYLIST (Legacy support) */
export const renamePlaylist = async (req, res) => {
  return updatePlaylist(req, res);
};

/* ADD SONG TO PLAYLIST */
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    const userId = req.userId;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      }
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    if (playlist.songIds.includes(songId)) {
      return res.status(400).json({ success: false, message: "Song already in playlist" });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        songIds: {
          push: songId
        }
      }
    });

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({ success: true, message: "Song added to playlist", playlist: updatedPlaylist });

  } catch (error) {
    console.error("Add song error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* REMOVE SONG FROM PLAYLIST */
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    const userId = req.userId;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      }
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    const updatedSongIds = playlist.songIds.filter(id => id !== songId);

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        songIds: updatedSongIds
      }
    });

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({ success: true, message: "Song removed from playlist", playlist: updatedPlaylist });

  } catch (error) {
    console.error("Remove song error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* REORDER PLAYLIST SONGS */
export const reorderPlaylistSongs = async (req, res) => {
  try {
    const { playlistId, songIds } = req.body;
    const userId = req.userId;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      }
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    // Validate all song IDs exist in playlist
    const validIds = songIds.filter(id =>
      playlist.songIds.includes(id)
    );

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        songIds: validIds
      }
    });

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({ success: true, message: "Playlist reordered", playlist: updatedPlaylist });

  } catch (error) {
    console.error("Reorder playlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* DELETE PLAYLIST */
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const userId = req.userId;

    const playlist = await prisma.playlist.deleteMany({
      where: {
        id: playlistId,
        userId
      }
    });

    if (playlist.count === 0) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({ success: true, message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Delete playlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* TOGGLE COLLABORATIVE */
export const toggleCollaborative = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const userId = req.userId;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      }
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        collaborative: !playlist.collaborative
      }
    });

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({
      success: true,
      collaborative: updatedPlaylist.collaborative,
      message: `Playlist is now ${updatedPlaylist.collaborative ? 'collaborative' : 'private'}`
    });

  } catch (error) {
    console.error("Toggle collaborative error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ADD COLLABORATOR */
export const addCollaborator = async (req, res) => {
  try {
    const { playlistId, collaboratorId } = req.body;
    const userId = req.userId;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      },
      include: {
        collaborators: true
      }
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    if (!playlist.collaborative) {
      return res.status(400).json({ success: false, message: "Playlist is not collaborative" });
    }

    if (playlist.collaborators.some(c => c.id === collaboratorId)) {
      return res.status(400).json({ success: false, message: "User is already a collaborator" });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        collaborators: {
          connect: { id: collaboratorId }
        }
      },
      include: {
        collaborators: true
      }
    });

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({ success: true, message: "Collaborator added", playlist: updatedPlaylist });

  } catch (error) {
    console.error("Add collaborator error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* REMOVE COLLABORATOR */
export const removeCollaborator = async (req, res) => {
  try {
    const { playlistId, collaboratorId } = req.body;
    const userId = req.userId;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      }
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        collaborators: {
          disconnect: { id: collaboratorId }
        }
      },
      include: {
        collaborators: true
      }
    });

    // Invalidate cache
    await redis.del(`playlists:${userId}`);

    res.json({ success: true, message: "Collaborator removed", playlist: updatedPlaylist });

  } catch (error) {
    console.error("Remove collaborator error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* --- PLAYBACK ROUTES (Stubs for now) --- */
export const startPlaylistPlayback = async (req, res) => res.json({ success: true });
export const togglePlaylistShuffle = async (req, res) => res.json({ success: true });
export const updatePlaylistLoop = async (req, res) => res.json({ success: true });
export const playlistPlayNext = async (req, res) => res.json({ success: true });
export const playlistAddToQueue = async (req, res) => res.json({ success: true });
