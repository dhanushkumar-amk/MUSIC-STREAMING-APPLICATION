import { z } from 'zod';

/**
 * GLOBAL ZOD VALIDATION MIDDLEWARE
 *
 * Prevents "Cast to ObjectId" and "Null Reference" errors before they hit business logic.
 * This is a FAANG-grade validation layer that ensures data integrity at the API boundary.
 *
 * Usage:
 * router.post('/endpoint', validate(schema), controller);
 */

/**
 * Validates request data against a Zod schema
 * @param {Object} schema - Object containing body, params, query schemas
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate request params
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      // Validate request query
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into a clean, user-friendly response
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }

      // Pass other errors to global error handler
      next(error);
    }
  };
};

/**
 * Common validation patterns for reuse across schemas
 */
export const commonValidations = {
  // MongoDB ObjectId validation
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),

  // Email validation
  email: z.string().email('Invalid email address').toLowerCase(),

  // Password validation (min 6 chars, at least 1 letter and 1 number)
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  // Name validation
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .trim(),

  // OTP validation (6 digits)
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),

  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),

  // Boolean flags
  boolean: z.coerce.boolean(),

  // URL validation
  url: z.string().url('Invalid URL'),

  // Optional string
  optionalString: z.string().optional(),

  // Non-empty string
  nonEmptyString: z.string().min(1, 'Field cannot be empty').trim(),

  // Array of MongoDB IDs
  mongoIdArray: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId')),

  // ISO Date string
  isoDate: z.string().datetime('Invalid ISO date string'),
};

export default validate;
