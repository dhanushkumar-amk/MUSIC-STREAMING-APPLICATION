import { z } from 'zod';
import { commonValidations } from '../middleware/validate.middleware.js';

/**
 * USER VALIDATION SCHEMAS
 *
 * All user-related request validation schemas.
 * Covers profile management, password changes, and account operations.
 */

export const userSchemas = {
  // PATCH /api/user/me/update
  updateProfile: {
    body: z.object({
      name: commonValidations.name.optional(),
      bio: z.string().max(200, 'Bio must not exceed 200 characters').optional()
    }).refine(data => data.name || data.bio, {
      message: 'At least one field (name or bio) must be provided'
    })
  },

  // PATCH /api/user/me/change-password
  changePassword: {
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: commonValidations.password
    }).refine(data => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from current password'
    })
  },

  // DELETE /api/user/:id (Admin)
  deleteUser: {
    params: z.object({
      id: commonValidations.mongoId
    })
  },

  // GET /api/user/list (Admin - with pagination)
  getAllUsers: {
    query: z.object({
      page: commonValidations.page,
      limit: commonValidations.limit,
      search: z.string().optional()
    })
  }
};
