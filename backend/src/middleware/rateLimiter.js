const rateLimit = require('express-rate-limit');
const { rateLimitHandler } = require('../utils/rateLimitHelpers');

// Card creation: 10 req/hour
exports.cardCreationLimiter = rateLimit({
  windowMs: 3600000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler({
    message: 'Too many cards created. Please try again later.',
    fallbackMs: 3600000,
    logKey: 'Card creation rate limit exceeded'
  }),
});

// Profile update: 10 req/hour
exports.profileUpdateLimiter = rateLimit({
  windowMs: 3600000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler({
    message: 'Too many profile updates. Please try again later.',
    fallbackMs: 3600000,
    logKey: 'Profile update rate limit exceeded'
  }),
});

// Broadcast: 5 req/hour
exports.broadcastLimiter = rateLimit({
  windowMs: 3600000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler({
    message: 'Too many broadcasts. Please try again later.',
    fallbackMs: 3600000,
    logKey: 'Broadcast rate limit exceeded'
  }),
});