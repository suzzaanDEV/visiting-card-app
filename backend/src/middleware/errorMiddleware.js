const logger = require('../utils/logger');
const auditService = require('../services/auditService');

module.exports = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);

  const statusCode = err.status || 500;
  const send = (body) => {
    auditService.log({
      action: 'system.error',
      entityType: 'system',
      statusCode,
      severity: statusCode >= 500 ? 'critical' : 'warning',
      success: false,
      errorMessage: err.message
    }).catch(() => {});
    return res.status(statusCode).json(body);
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return send({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return send({ error: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    return send({ error: 'Duplicate field value' });
  }

  return send({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
};