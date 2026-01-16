import { z } from 'zod';
import { commonValidations } from '../middleware/validate.middleware.js';

/**
 * SONG & ALBUM VALIDATION SCHEMAS
 *
 * Validation schemas for song and album operations.
 * Note: File uploads (image, audio) are handled by multer middleware,
 * so we validate other fields here.
 */

export const songSchemas = {
  // POST /api/song/add
  // Note: image and audio are handled by multer
  addSong: {
    body: z.object({
      name: z.string().min(1, 'Song name is required').max(200).trim(),
      desc: z.string().max(1000, 'Description too long').optional(),
      album: commonValidations.mongoId,
      artist: commonValidations.mongoId.optional(),
      duration: z.coerce.number().positive('Duration must be positive').optional(),
      genre: z.string().max(50).optional(),
      releaseYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional()
    })
  },

  // GET /api/song/paginated
  getPaginatedSongs: {
    query: z.object({
      page: commonValidations.page,
      limit: commonValidations.limit,
      genre: z.string().optional(),
      artist: commonValidations.mongoId.optional(),
      album: commonValidations.mongoId.optional(),
      search: z.string().optional()
    })
  },

  // POST /api/song/remove
  removeSong: {
    body: z.object({
      id: commonValidations.mongoId
    })
  }
};

export const albumSchemas = {
  // POST /api/album/add
  // Note: image is handled by multer
  addAlbum: {
    body: z.object({
      name: z.string().min(1, 'Album name is required').max(200).trim(),
      desc: z.string().max(1000, 'Description too long').optional(),
      bgColour: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#000000'),
      artist: commonValidations.mongoId.optional(),
      releaseYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional()
    })
  },

  // GET /api/album/list
  listAlbum: {
    query: z.object({
      page: commonValidations.page,
      limit: commonValidations.limit,
      artist: commonValidations.mongoId.optional()
    })
  },

  // POST /api/album/remove
  removeAlbum: {
    body: z.object({
      id: commonValidations.mongoId
    })
  }
};
