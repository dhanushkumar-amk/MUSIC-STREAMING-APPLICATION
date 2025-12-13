import api from "./api";

/* SONG SERVICE */
export const songService = {
  getAll: async () => {
    const response = await api.get("/song/list");
    return response.data;
  },
  add: async (formData) => {
    const response = await api.post("/song/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

/* ALBUM SERVICE */
export const albumService = {
  getAll: async () => {
    const response = await api.get("/album/list");
    return response.data;
  },
};

/* PLAYLIST SERVICE */
export const playlistService = {
  create: async (name, desc) => {
    const response = await api.post("/playlist/create", { name, desc });
    return response.data;
  },
  getUserPlaylists: async () => {
    const response = await api.get("/playlist/list");
    return response.data;
  },
  addSong: async (playlistId, songId) => {
    const response = await api.post("/playlist/add-song", { playlistId, songId });
    return response.data;
  },
  removeSong: async (playlistId, songId) => {
    const response = await api.post("/playlist/remove-song", { playlistId, songId });
    return response.data;
  },
  delete: async (playlistId) => {
    const response = await api.post("/playlist/delete", { playlistId });
    return response.data;
  },
};

/* USER SERVICE */
export const userService = {
  getProfile: async () => {
    const response = await api.get("/user/me");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.patch("/user/me/update", data);
    return response.data;
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.patch("/user/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

/* SEARCH SERVICE */
export const searchService = {
  search: async (query) => {
    const response = await api.get(`/search?q=${query}`);
    return response.data;
  }
};

/* PLAY STATS SERVICE */
export const playStatsService = {
    recordPlay: async (songId) => {
        return { success: true };
    },
    getRecentlyPlayed: async () => {
        return { success: true, songs: [] };
    }
}

/* LIBRARY SERVICE (Aligning with LibraryPage.jsx) */
export const libraryService = {
    checkSong: async (songId) => {
        return { success: true, saved: false };
    },
    saveSong: async (songId) => {
        return { success: true, saved: true };
    },
    unsaveSong: async (songId) => {
        return { success: true, saved: false };
    },
    getSavedSongs: async () => {
        return { success: true, songs: [] };
    },

    // Alias methods to match LibraryPage.jsx expectations
    getLikedSongs: async () => {
        return { success: true, songs: [] }; // Mock return for now
    },
    unlikeSong: async (songId) => {
        return { success: true, saved: false };
    }
}
