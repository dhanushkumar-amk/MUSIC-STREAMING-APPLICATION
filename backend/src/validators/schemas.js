import { z } from 'zod';

/**
 * Common Validation Schemas
 * Reusable Zod schemas for request validation across the application
 */

// MongoDB ObjectId validation
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Pagination schemas
const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  sort: z.string().optional().default('-createdAt')
});

// User schemas
export const userSchemas = {
  register: z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    displayName: z.string().min(1).max(50).optional()
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),

  updateProfile: z.object({
    displayName: z.string().min(1).max(50).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional()
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100)
  })
};

// Song schemas
export const songSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    artist: objectId,
    album: objectId.optional(),
    duration: z.number().positive(),
    genre: z.string().optional(),
    releaseYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    audioUrl: z.string().url(),
    coverImage: z.string().url().optional(),
    lyrics: z.string().optional()
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    artist: objectId.optional(),
    album: objectId.optional(),
    duration: z.number().positive().optional(),
    genre: z.string().optional(),
    releaseYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    audioUrl: z.string().url().optional(),
    coverImage: z.string().url().optional(),
    lyrics: z.string().optional()
  }),

  query: z.object({
    artist: objectId.optional(),
    album: objectId.optional(),
    genre: z.string().optional(),
    search: z.string().optional(),
    ...paginationSchema.shape
  })
};

// Album schemas
export const albumSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    artist: objectId,
    releaseYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    coverImage: z.string().url().optional(),
    genre: z.string().optional(),
    description: z.string().max(1000).optional()
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    artist: objectId.optional(),
    releaseYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    coverImage: z.string().url().optional(),
    genre: z.string().optional(),
    description: z.string().max(1000).optional()
  })
};

// Playlist schemas
export const playlistSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional().default(true),
    coverImage: z.string().url().optional()
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
    coverImage: z.string().url().optional()
  }),

  addSong: z.object({
    songId: objectId
  }),

  removeSong: z.object({
    songId: objectId
  }),

  reorder: z.object({
    songIds: z.array(objectId).min(1)
  })
};

// Artist schemas
export const artistSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    bio: z.string().max(2000).optional(),
    image: z.string().url().optional(),
    genres: z.array(z.string()).optional(),
    socialLinks: z.object({
      spotify: z.string().url().optional(),
      instagram: z.string().url().optional(),
      twitter: z.string().url().optional(),
      website: z.string().url().optional()
    }).optional()
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(2000).optional(),
    image: z.string().url().optional(),
    genres: z.array(z.string()).optional(),
    socialLinks: z.object({
      spotify: z.string().url().optional(),
      instagram: z.string().url().optional(),
      twitter: z.string().url().optional(),
      website: z.string().url().optional()
    }).optional()
  })
};

// Session schemas (for collaborative listening)
export const sessionSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    isPublic: z.boolean().optional().default(false),
    maxParticipants: z.number().int().min(2).max(100).optional().default(10)
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    isPublic: z.boolean().optional(),
    maxParticipants: z.number().int().min(2).max(100).optional()
  }),

  addToQueue: z.object({
    songId: objectId
  })
};

// Param schemas (for route params)
export const paramSchemas = {
  id: z.object({
    id: objectId
  }),

  songId: z.object({
    songId: objectId
  }),

  albumId: z.object({
    albumId: objectId
  }),

  artistId: z.object({
    artistId: objectId
  }),

  playlistId: z.object({
    playlistId: objectId
  }),

  sessionId: z.object({
    sessionId: objectId
  })
};

export { objectId, paginationSchema };
