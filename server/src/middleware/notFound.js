/**
 * 404 handler middleware.
 * Catches requests to undefined routes.
 */

import AppError from '../utils/AppError.js';

const notFound = (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
};

export default notFound;
