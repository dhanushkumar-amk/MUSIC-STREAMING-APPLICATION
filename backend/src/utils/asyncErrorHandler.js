/**
 * Async Error Handler Wrapper
 * Eliminates repetitive try-catch blocks in route handlers
 * Automatically passes errors to Express error middleware
 *
 * Usage:
 * router.get('/songs', asyncErrorHandler(async (req, res, next) => {
 *   const songs = await Song.find();
 *   res.json(songs);
 * }));
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncErrorHandler;
