const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => { 
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Unexpected server error.';

  if (statusCode >= 500) {
    console.error(err);
  }

  const errorPayload = Array.isArray(err.error) ? err.error : err.error;

  return sendError(res, {
    status: statusCode,
    message,
    error: errorPayload,
  });
};

module.exports = errorHandler;

