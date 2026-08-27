const rateLimit = require('express-rate-limit');

// Search rate limit: 30 req/min
exports.searchLimiter = rateLimit({
  windowMs: 60000,
  max: 30,
  message: { error: 'Too many search requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Card creation: 10 req/hour
exports.cardCreationLimiter = rateLimit({
  windowMs: 3600000,
  max: 10,
  message: { error: 'Too many cards created' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Profile update: 10 req/hour
exports.profileUpdateLimiter = rateLimit({
  windowMs: 3600000,
  max: 10,
  message: { error: 'Too many profile updates' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Broadcast: 5 req/hour
exports.broadcastLimiter = rateLimit({
  windowMs: 3600000,
  max: 5,
  message: { error: 'Too many broadcasts' },
  standardHeaders: true,
  legacyHeaders: false,
});
