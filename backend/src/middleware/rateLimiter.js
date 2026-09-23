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

// Broadcast management actions (create/schedule/update): 30 req/hour.
// Creating or scheduling a broadcast dispatches nothing by itself — the
// aggressive cap is reserved for actual delivery dispatch (broadcastSendLimiter).
exports.broadcastLimiter = rateLimit({
  windowMs: 3600000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler({
    message: 'Too many broadcast actions. Please try again later.',
    fallbackMs: 3600000,
    logKey: 'Broadcast action rate limit exceeded'
  }),
});

// Broadcast delivery dispatch (send-now): 5 req/hour. This is the action that
// actually queues delivery to every recipient, so it stays intentionally strict.
exports.broadcastSendLimiter = rateLimit({
  windowMs: 3600000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler({
    message: 'Too many broadcast sends. Please try again later.',
    fallbackMs: 3600000,
    logKey: 'Broadcast send rate limit exceeded'
  }),
});