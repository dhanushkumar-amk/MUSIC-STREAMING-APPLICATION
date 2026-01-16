import { z } from 'zod';
import { commonValidations } from '../middleware/validate.middleware.js';

/**
 * AUTH VALIDATION SCHEMAS
 *
 * All authentication-related request validation schemas.
 * Prevents invalid data from reaching the auth controllers.
 */

export const authSchemas = {
  // POST /api/auth/register
  register: {
    body: z.object({
      name: commonValidations.name,
      email: commonValidations.email,
      password: commonValidations.password
    })
  },

  // POST /api/auth/login
  login: {
    body: z.object({
      email: commonValidations.email,
      password: z.string().min(1, 'Password is required')
    })
  },

  // POST /api/auth/login/verify-otp
  verifyLoginOTP: {
    body: z.object({
      userId: commonValidations.mongoId,
      otp: commonValidations.otp
    })
  },

  // POST /api/auth/refresh-token
  refreshToken: {
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required')
    })
  },

  // POST /api/auth/forgot-password
  forgotPassword: {
    body: z.object({
      email: commonValidations.email
    })
  },

  // POST /api/auth/reset-password
  resetPassword: {
    body: z.object({
      userId: commonValidations.mongoId,
      otp: commonValidations.otp,
      newPassword: commonValidations.password
    })
  },

  // POST /api/auth/logout
  logout: {
    body: z.object({
      refreshToken: z.string().optional()
    })
  }
};
