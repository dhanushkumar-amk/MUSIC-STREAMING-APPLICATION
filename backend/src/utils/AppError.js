/**
 * Custom Application Error Class
 * Extends native Error with HTTP status codes and operational flag
 * Used for predictable, FAANG-style error handling
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Distinguishes operational errors from programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
