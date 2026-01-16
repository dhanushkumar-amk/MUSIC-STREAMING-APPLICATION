import api from './api';

const artistAPI = {
  // Get all artists with filters
  getAllArtists: async (params = {}) => {
    const response = await api.get('/artist/list', { params });
    return response.data;
  },

  // Get artist by ID
  getArtistById: async (id) => {
    const response = await api.get(`/artist/${id}`);
    return response.data;
  },

  // Get top artists
  getTopArtists: async (limit = 10, metric = 'followers') => {
    const response = await api.get('/artist/top', {
      params: { limit, metric }
    });
    return response.data;
  },

  // Get featured artists
  getFeaturedArtists: async () => {
    const response = await api.get('/artist/featured');
    return response.data;
  },

  // Search artists
  searchArtists: async (query, limit = 10) => {
    const response = await api.get('/artist/search', {
      params: { q: query, limit }
    });
    return response.data;
  },

  // Get artists by genre
  getArtistsByGenre: async (genre, limit = 20) => {
    const response = await api.get(`/artist/genre/${genre}`, {
      params: { limit }
    });
    return response.data;
  },

  // Get similar artists
  getSimilarArtists: async (id, limit = 10) => {
    const response = await api.get(`/artist/${id}/similar`, {
      params: { limit }
    });
    return response.data;
  },

  // Follow artist
  followArtist: async (id) => {
    const response = await api.post(`/artist/${id}/follow`);
    return response.data;
  },

  // Unfollow artist
  unfollowArtist: async (id) => {
    const response = await api.post(`/artist/${id}/unfollow`);
    return response.data;
  },

  // Get followed artists
  getFollowedArtists: async () => {
    const response = await api.get('/artist/me/following');
    return response.data;
  },

  // Get artist stats (admin)
  getArtistStats: async (id) => {
    const response = await api.get(`/artist/${id}/stats`);
    return response.data;
  },

  // Create artist (admin)
  createArtist: async (formData) => {
    const response = await api.post('/artist/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update artist (admin)
  updateArtist: async (id, formData) => {
    const response = await api.patch(`/artist/${id}/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete artist (admin)
  deleteArtist: async (id) => {
    const response = await api.delete(`/artist/${id}`);
    return response.data;
  }
};

export default artistAPI;
