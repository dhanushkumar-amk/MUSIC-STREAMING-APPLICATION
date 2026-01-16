import { z } from 'zod';
import { commonValidations } from '../middleware/validate.middleware.js';

/**
 * PLAYLIST VALIDATION SCHEMAS
 *
 * All playlist-related request validation schemas.
 * Covers CRUD operations, song management, and collaborative features.
 */

export const playlistSchemas = {
  // POST /api/playlist/create
  createPlaylist: {
    body: z.object({
      name: z.string().min(1, 'Playlist name is required').max(100, 'Playlist name too long').trim(),
      description: z.string().max(500, 'Description too long').optional(),
      isPublic: commonValidations.boolean.default(true),
      isCollaborative: commonValidations.boolean.default(false)
    })
  },

  // GET /api/playlist/:playlistId
  getPlaylist: {
    params: z.object({
      playlistId: commonValidations.mongoId
    })
  },

  // GET /api/playlist/list
  getPlaylists: {
    query: z.object({
      page: commonValidations.page,
      limit: commonValidations.limit,
      userId: commonValidations.mongoId.optional()
    })
  },

  // PUT /api/playlist/update
  updatePlaylist: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      name: z.string().min(1).max(100).trim().optional(),
      description: z.string().max(500).optional(),
      isPublic: commonValidations.boolean.optional(),
      coverImage: commonValidations.url.optional()
    }).refine(data => data.name || data.description !== undefined || data.isPublic !== undefined || data.coverImage, {
      message: 'At least one field must be provided for update'
    })
  },

  // POST /api/playlist/rename
  renamePlaylist: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      name: z.string().min(1, 'Playlist name is required').max(100).trim()
    })
  },

  // DELETE /api/playlist/delete
  deletePlaylist: {
    body: z.object({
      playlistId: commonValidations.mongoId
    })
  },

  // POST /api/playlist/add-song
  addSongToPlaylist: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      songId: commonValidations.mongoId
    })
  },

  // POST /api/playlist/remove-song
  removeSongFromPlaylist: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      songId: commonValidations.mongoId
    })
  },

  // POST /api/playlist/reorder
  reorderPlaylistSongs: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      songIds: commonValidations.mongoIdArray.min(1, 'At least one song ID required')
    })
  },

  // POST /api/playlist/toggle-collaborative
  toggleCollaborative: {
    body: z.object({
      playlistId: commonValidations.mongoId
    })
  },

  // POST /api/playlist/add-collaborator
  addCollaborator: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      userId: commonValidations.mongoId
    })
  },

  // POST /api/playlist/remove-collaborator
  removeCollaborator: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      userId: commonValidations.mongoId
    })
  },

  // POST /api/playlist/start-playback
  startPlaylistPlayback: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      startIndex: z.coerce.number().int().min(0).default(0)
    })
  },

  // POST /api/playlist/toggle-shuffle
  togglePlaylistShuffle: {
    body: z.object({
      playlistId: commonValidations.mongoId
    })
  },

  // POST /api/playlist/update-loop
  updatePlaylistLoop: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      loopMode: z.enum(['none', 'playlist', 'song'], {
        errorMap: () => ({ message: 'Loop mode must be one of: none, playlist, song' })
      })
    })
  },

  // POST /api/playlist/play-next
  playlistPlayNext: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      songId: commonValidations.mongoId
    })
  },

  // POST /api/playlist/add-to-queue
  playlistAddToQueue: {
    body: z.object({
      playlistId: commonValidations.mongoId,
      songId: commonValidations.mongoId
    })
  }
};
