import { z } from 'zod';
import { commonValidations } from '../middleware/validate.middleware.js';

/**
 * LIBRARY VALIDATION SCHEMAS
 *
 * Validation for user library operations (liked songs, albums).
 */

export const librarySchemas = {
  // POST /api/library/song/like
  likeSong: {
    body: z.object({
      songId: commonValidations.mongoId
    })
  },

  // POST /api/library/song/unlike
  unlikeSong: {
    body: z.object({
      songId: commonValidations.mongoId
    })
  },

  // GET /api/library/song/list
  getLikedSongs: {
    query: z.object({
      page: commonValidations.page,
      limit: commonValidations.limit
    })
  },

  // POST /api/library/album/like
  likeAlbum: {
    body: z.object({
      albumId: commonValidations.mongoId
    })
  },

  // POST /api/library/album/unlike
  unlikeAlbum: {
    body: z.object({
      albumId: commonValidations.mongoId
    })
  },

  // GET /api/library/album/list
  getLikedAlbums: {
    query: z.object({
      page: commonValidations.page,
      limit: commonValidations.limit
    })
  }
};

/**
 * QUEUE VALIDATION SCHEMAS
 *
 * Validation for playback queue operations.
 */

export const queueSchemas = {
  // POST /api/queue/start
  startQueue: {
    body: z.object({
      songIds: commonValidations.mongoIdArray.min(1, 'At least one song required'),
      startIndex: z.coerce.number().int().min(0).default(0),
      shuffle: commonValidations.boolean.default(false)
    })
  },

  // POST /api/queue/loop
  updateLoopMode: {
    body: z.object({
      loopMode: z.enum(['none', 'queue', 'song'], {
        errorMap: () => ({ message: 'Loop mode must be one of: none, queue, song' })
      })
    })
  },

  // POST /api/queue/add
  addToQueue: {
    body: z.object({
      songId: commonValidations.mongoId
    })
  },

  // POST /api/queue/play-next
  playNext: {
    body: z.object({
      songId: commonValidations.mongoId
    })
  },

  // POST /api/queue/remove
  removeFromQueue: {
    body: z.object({
      songId: commonValidations.mongoId
    })
  }
};

/**
 * SESSION VALIDATION SCHEMAS
 *
 * Validation for collaborative listening session operations.
 */

export const sessionSchemas = {
  // POST /api/session/create
  createSession: {
    body: z.object({
      name: z.string().min(1, 'Session name is required').max(100).trim(),
      isPublic: commonValidations.boolean.default(false),
      maxParticipants: z.coerce.number().int().min(2).max(50).default(10)
    })
  },

  // GET /api/session/:code
  getSession: {
    params: z.object({
      code: z.string().length(6, 'Session code must be 6 characters').toUpperCase()
    })
  },

  // POST /api/session/:code/join
  joinSession: {
    params: z.object({
      code: z.string().length(6, 'Session code must be 6 characters').toUpperCase()
    })
  },

  // POST /api/session/:code/leave
  leaveSession: {
    params: z.object({
      code: z.string().length(6, 'Session code must be 6 characters').toUpperCase()
    })
  },

  // PATCH /api/session/:code/settings
  updateSessionSettings: {
    params: z.object({
      code: z.string().length(6, 'Session code must be 6 characters').toUpperCase()
    }),
    body: z.object({
      name: z.string().min(1).max(100).trim().optional(),
      isPublic: commonValidations.boolean.optional(),
      maxParticipants: z.coerce.number().int().min(2).max(50).optional(),
      allowGuestControl: commonValidations.boolean.optional()
    }).refine(data => Object.keys(data).length > 0, {
      message: 'At least one setting must be provided'
    })
  },

  // DELETE /api/session/:code
  endSession: {
    params: z.object({
      code: z.string().length(6, 'Session code must be 6 characters').toUpperCase()
    })
  },

  // GET /api/session/:code/chat
  getChatMessages: {
    params: z.object({
      code: z.string().length(6, 'Session code must be 6 characters').toUpperCase()
    }),
    query: z.object({
      limit: commonValidations.limit,
      before: commonValidations.isoDate.optional()
    })
  },

  // POST /api/session/:code/chat
  sendChatMessage: {
    params: z.object({
      code: z.string().length(6, 'Session code must be 6 characters').toUpperCase()
    }),
    body: z.object({
      message: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long').trim()
    })
  },

  // POST /api/session/:code/queue/add
  addToSessionQueue: {
    params: z.object({
      code: z.string().length(6, 'Session code must be 6 characters').toUpperCase()
    }),
    body: z.object({
      songId: commonValidations.mongoId
    })
  }
};
