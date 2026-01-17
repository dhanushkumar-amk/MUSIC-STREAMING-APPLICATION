import { z } from 'zod';
import AppError from '../utils/AppError.js';

/**
 * Zod Validation Middleware Factory
 * Validates request body, query, or params against a Zod schema
 * Prevents "Cast to ObjectId" and "Null Reference" errors before they hit logic
 *
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to validate: 'body', 'query', or 'params'
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];

      // Parse and validate data
      const validated = schema.parse(dataToValidate);

      // Replace request data with validated (and potentially transformed) data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into readable messages
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        const message = errors.map(e => `${e.field}: ${e.message}`).join(', ');
        return next(new AppError(`Validation failed: ${message}`, 400));
      }

      next(error);
    }
  };
};

export default validate;
