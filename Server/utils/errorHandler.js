// File Path: /utils/errorHandler.js

const logger = require('./logger');

module.exports = (err, req, res, next) => {
  logger.error('Unhandled Error', { error: err.message, stack: err.stack });

  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'An unexpected error occurred',
  });
};
