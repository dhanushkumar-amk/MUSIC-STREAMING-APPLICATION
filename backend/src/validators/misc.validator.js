import { z } from 'zod';
import { commonValidations } from '../middleware/validate.middleware.js';

/**
 * ARTIST VALIDATION SCHEMAS
 *
 * Validation for artist-related operations.
 */

export const artistSchemas = {
  // POST /api/artist/create
  createArtist: {
    body: z.object({
      name: z.string().min(1, 'Artist name is required').max(100).trim(),
      bio: z.string().max(2000, 'Bio too long').optional(),
      genres: z.string().optional(), // Will be parsed as JSON
      country: z.string().max(100).optional(),
      verified: z.union([z.string(), z.boolean()]).optional(),
      featured: z.union([z.string(), z.boolean()]).optional(),
      socialLinks: z.string().optional() // Will be parsed as JSON
    }).passthrough() // Allow additional fields like files
  },

  // GET /api/artist/list
  getAllArtists: {
    query: z.object({
      page: commonValidations.page,
      limit: commonValidations.limit,
      genre: z.string().optional(),
      country: z.string().optional(),
      verified: commonValidations.boolean.optional()
    })
  },

  // GET /api/artist/:id
  getArtistById: {
    params: z.object({
      id: commonValidations.mongoId
    })
  },

  // PATCH /api/artist/:id/update
  updateArtist: {
    params: z.object({
      id: commonValidations.mongoId
    }),
    body: z.object({
      name: z.string().min(1).max(100).trim().optional(),
      bio: z.string().max(2000).optional(),
      genre: z.array(z.string().max(50)).max(10).optional(),
      country: z.string().max(100).optional(),
      verified: commonValidations.boolean.optional()
    })
  },

  // DELETE /api/artist/:id
  deleteArtist: {
    params: z.object({
      id: commonValidations.mongoId
    })
  },

  // POST /api/artist/:id/follow
  followArtist: {
    params: z.object({
      id: commonValidations.mongoId
    })
  },

  // POST /api/artist/:id/unfollow
  unfollowArtist: {
    params: z.object({
      id: commonValidations.mongoId
    })
  },

  // GET /api/artist/search
  searchArtists: {
    query: z.object({
      q: z.string().min(1, 'Search query required'),
      limit: commonValidations.limit
    })
  },

  // GET /api/artist/genre/:genre
  getArtistsByGenre: {
    params: z.object({
      genre: z.string().min(1, 'Genre required')
    }),
    query: z.object({
      page: commonValidations.page,
      limit: commonValidations.limit
    })
  },

  // GET /api/artist/:id/similar
  getSimilarArtists: {
    params: z.object({
      id: commonValidations.mongoId
    }),
    query: z.object({
      limit: commonValidations.limit
    })
  }
};

/**
 * LYRICS VALIDATION SCHEMAS
 */

export const lyricsSchemas = {
  // GET /api/lyrics/:songId
  getLyrics: {
    params: z.object({
      songId: commonValidations.mongoId
    })
  },

  // POST /api/lyrics/add
  addLyrics: {
    body: z.object({
      songId: commonValidations.mongoId,
      lyrics: z.string().min(1, 'Lyrics cannot be empty').max(50000, 'Lyrics too long'),
      syncedLyrics: z.array(z.object({
        time: z.number().nonnegative(),
        text: z.string()
      })).optional()
    })
  }
};

/**
 * SEARCH & RECOMMENDATION VALIDATION SCHEMAS
 */

export const searchSchemas = {
  // GET /api/search
  search: {
    query: z.object({
      q: z.string().min(1, 'Search query required').max(200),
      type: z.enum(['all', 'song', 'album', 'artist', 'playlist'], {
        errorMap: () => ({ message: 'Type must be one of: all, song, album, artist, playlist' })
      }).default('all'),
      limit: commonValidations.limit
    })
  },

  // GET /api/autocomplete
  autocomplete: {
    query: z.object({
      q: z.string().min(1, 'Query required').max(100),
      limit: z.coerce.number().int().positive().max(10).default(5)
    })
  }
};

export const recommendationSchemas = {
  // GET /api/recommendations
  getRecommendations: {
    query: z.object({
      type: z.enum(['similar', 'based-on-history', 'trending', 'new-releases']).default('similar'),
      songId: commonValidations.mongoId.optional(),
      limit: commonValidations.limit
    })
  }
};

/**
 * USER SETTINGS VALIDATION SCHEMAS
 */

export const userSettingsSchemas = {
  // PUT /api/settings
  updateAllSettings: {
    body: z.object({
      audioQuality: z.enum(['low', 'medium', 'high', 'very-high']).optional(),
      crossfadeDuration: z.coerce.number().min(0).max(12).optional(),
      gaplessPlayback: commonValidations.boolean.optional(),
      normalizeVolume: commonValidations.boolean.optional(),
      playbackSpeed: z.coerce.number().min(0.5).max(2.0).optional(),
      equalizerEnabled: commonValidations.boolean.optional(),
      equalizerPreset: z.string().max(50).optional(),
      equalizerBands: z.array(z.number().min(-12).max(12)).length(10).optional()
    })
  },

  // PATCH /api/settings/audio-quality
  updateAudioQuality: {
    body: z.object({
      quality: z.enum(['low', 'medium', 'high', 'very-high'], {
        errorMap: () => ({ message: 'Quality must be one of: low, medium, high, very-high' })
      })
    })
  },

  // PATCH /api/settings/crossfade
  updateCrossfade: {
    body: z.object({
      duration: z.coerce.number().min(0, 'Duration must be at least 0').max(12, 'Duration cannot exceed 12 seconds')
    })
  },

  // PATCH /api/settings/playback-speed
  updatePlaybackSpeed: {
    body: z.object({
      speed: z.coerce.number().min(0.5, 'Speed must be at least 0.5x').max(2.0, 'Speed cannot exceed 2.0x')
    })
  },

  // PATCH /api/settings/equalizer/preset
  updateEqualizerPreset: {
    body: z.object({
      preset: z.string().min(1, 'Preset name required').max(50)
    })
  },

  // PATCH /api/settings/equalizer/bands
  updateEqualizerBands: {
    body: z.object({
      bands: z.array(z.number().min(-12).max(12)).length(10, 'Equalizer must have exactly 10 bands')
    })
  }
};

/**
 * STATS & ANALYTICS VALIDATION SCHEMAS
 */

export const statsSchemas = {
  // POST /api/stats/play
  recordPlay: {
    body: z.object({
      songId: commonValidations.mongoId,
      duration: z.coerce.number().positive('Duration must be positive'),
      timestamp: commonValidations.isoDate.optional()
    })
  },

  // GET /api/stats/top
  getTopStats: {
    query: z.object({
      type: z.enum(['songs', 'artists', 'albums']).default('songs'),
      timeRange: z.enum(['week', 'month', 'year', 'all-time']).default('month'),
      limit: commonValidations.limit
    })
  }
};

/**
 * RECENTLY PLAYED VALIDATION SCHEMAS
 */

export const recentlyPlayedSchemas = {
  // POST /api/recently-played/add
  addRecentlyPlayed: {
    body: z.object({
      songId: commonValidations.mongoId
    })
  },

  // GET /api/recently-played/list
  getRecentlyPlayed: {
    query: z.object({
      limit: commonValidations.limit
    })
  }
};
