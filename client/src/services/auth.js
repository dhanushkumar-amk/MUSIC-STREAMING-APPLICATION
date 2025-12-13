import api from './api';

export const authService = {
  // Register with name, email, password
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data; // Returns { success, message, userId, checkToken }
  },

  // Login returns tokens directly (no OTP for login)
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    // Store tokens if login successful
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data;
  },

  // Verify OTP after registration
  verifyOTP: async (userId, otp) => {
    const response = await api.post('/auth/login/verify-otp', { userId, otp });

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data; // Returns { success, message, userId }
  },

  // Reset password with OTP
  resetPassword: async (userId, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { userId, otp, newPassword });
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/user/me');
    return response.data;
  }
};
