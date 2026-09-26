const crypto = require('crypto');
const requestContext = require('../utils/requestContext');

// Captures per-request context (request id, correlation id, method, path, ip,
// user-agent, start time) so every audit log recorded during the request is
// automatically enriched — callers keep their existing single-line writes.
module.exports = function auditContext(req, res, next) {
  const ctx = {
    requestId: crypto.randomUUID(),
    correlationId: req.get('x-correlation-id') || req.get('x-request-id') || null,
    method: req.method,
    path: req.originalUrl || req.url,
    ipAddress: req.ip,
    userAgent: req.get('user-agent') || null,
    startedAt: Date.now()
  };
  requestContext.run(ctx, () => next());
};