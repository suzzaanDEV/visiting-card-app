const logger = require('./logger');

// Real remaining time until the current rate-limit window resets. express-rate-limit
// exposes req.rateLimit.resetTime on every request it processes (including 429s).
function remainingMs(req, fallbackMs = 15 * 60 * 1000) {
  if (req.rateLimit && req.rateLimit.resetTime) {
    return Math.max(0, new Date(req.rateLimit.resetTime).getTime() - Date.now());
  }
  return fallbackMs;
}

// Human-friendly, e.g. "12 minutes and 30 seconds" or "45 seconds".
function formatWait(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} second${secs === 1 ? '' : 's'}`;
  const parts = [`${mins} minute${mins === 1 ? '' : 's'}`];
  if (secs > 0) parts.push(`${secs} second${secs === 1 ? '' : 's'}`);
  return parts.join(' and ');
}

// Standard 429 JSON body that reports the REAL remaining wait time.
function rateLimitErrorBody(req, message = 'Too many requests, please try again later.', fallbackMs = 15 * 60 * 1000) {
  const seconds = Math.max(1, Math.ceil(remainingMs(req, fallbackMs) / 1000));
  return {
    error: `Too many requests. Please wait ${formatWait(seconds)} before trying again.`,
    message,
    retryAfter: seconds,
    retryAfterMinutes: Math.floor(seconds / 60)
  };
}

// Reusable express-rate-limit handler: logs the block, sets a real Retry-After
// header and returns the remaining wait time to the client.
function rateLimitHandler({ message, fallbackMs, logKey = 'Rate limit exceeded' } = {}) {
  return (req, res) => {
    logger.security(logKey, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    const body = rateLimitErrorBody(req, message, fallbackMs);
    res.set('Retry-After', String(body.retryAfter));
    res.status(429).json(body);
  };
}

module.exports = { remainingMs, formatWait, rateLimitErrorBody, rateLimitHandler };